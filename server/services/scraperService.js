import axios from 'axios';
import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';
import { db } from '../firebase.js';

const BASE_URL = 'https://www.buyrentkenya.com';

export async function scrapeBuyRentKenya(type = 'sale', location = 'nairobi', maxPages = 5) {
  const categoryPath = type === 'rent' ? 'flats-apartments-for-rent' : 'flats-apartments-for-sale';
  const allListings = [];

  for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 
        ? `${BASE_URL}/${categoryPath}/${location}`
        : `${BASE_URL}/${categoryPath}/${location}?page=${page}`;
      
      console.log(`Scraping Page ${page}/${maxPages}: ${url}...`);
      
      try {
        const { data } = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
    
    const $ = cheerio.load(data);
    const listings = [];

    // Strategy: Find all price elements and traverse up to the card
    // Price selector based on observation: text-xl font-bold
    const priceElements = $('div.text-xl.font-bold, span.text-xl.font-bold').filter((i, el) => {
      const text = $(el).text().trim();
      return text.includes('KSh') || text.includes('KES');
    });

    console.log(`Found ${priceElements.length} price elements`);

    priceElements.each((i, el) => {
      try {
        const priceText = $(el).text().trim();
        const price = parseInt(priceText.replace(/[^0-9]/g, ''));
        
        // Traverse up to find the container
        // The container usually links to the property or contains the title
        // We'll traverse up until we find a significant container size or class
        let card = $(el).closest('div.bg-white'); // Common card background
        if (card.length === 0) card = $(el).parents('div').eq(3); // Fallback

        // Find Title
        const titleEl = card.find('h3, .text-lg, a.no-underline').filter((i, t) => $(t).text().trim().length > 10).first();
        let title = titleEl.text().replace(/\s+/g, ' ').trim();
        
        // Remove price from title if present
        title = title.replace(/KSh\s*[\d,]+/, '').trim();

        // Improved Link Finding
        let link = null;
        card.find('a').each((i, a) => {
           const href = $(a).attr('href');
           if (href && href.length > 20 && !href.includes('javascript') && !href.includes('tel:')) {
             link = href;
             return false; // break
           }
        });
        
        // Fallback for ID if no valid link
        const uniqueId = link 
          ? link.split('/').pop() 
          : `brk_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}`;

        // Find Location (usually in a specific class or next to an icon)
        // Heuristic: look for text that matches common locations or is in a 'text-grey-500' div
        // On BRK, often the location is just under the title or near a pin icon
        let address = '';
        const possibleAddress = card.find('p, span').filter((i, el) => {
            const t = $(el).text().trim();
            return t.includes('Nairobi') || t.includes(location) || $(el).find('svg').length > 0;
        }).first();
        address = possibleAddress.text().trim() || location;

        const bedsText = card.text().match(/(\d+)\s*Bed/i);
        const bedrooms = bedsText ? parseInt(bedsText[1]) : 0;

        // Find Furnishing Status
        const cardText = card.text().toLowerCase();
        let furnishingStatus = 'unknown';
        let isFurnished = false;

        if (/\bunfurnished\b/.test(cardText)) {
            furnishingStatus = 'unfurnished';
            isFurnished = false;
        } else if (/\bfurnished\b/.test(cardText)) {
            furnishingStatus = 'furnished';
            isFurnished = true;
        }

        if (price > 10000 && title) { // Basic sanity check on price
          listings.push({
            externalId: uniqueId,
            source: 'buyrentkenya',
            type, // 'sale' or 'rent'
            locationQuery: location,
            address,
            title,
            price,
            currency: 'KES',
            bedrooms,
            furnishingStatus,
            isFurnished,
            url: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : '',
            scrapedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error parsing listing:', err.message);
      }
    });



    console.log(`Page ${page}: Successfully parsed ${listings.length} listings`);
    
    // Add to main collection
    allListings.push(...listings);

    // If no listings found on this page, stop
    if (listings.length === 0) {
        console.log('No listings found on this page, stopping pagination.');
        break;
    }

    // Random Delay between pages
    if (page < maxPages) {
        const delay = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000); // 5-10s
        console.log(`Waiting ${delay}ms before next page...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    } catch (pageError) {
        console.error(`Error scraping page ${page}:`, pageError.message);
        // Continue to next page instead of failing entire job
    }
  } // End of page loop

  console.log(`Total listings collected: ${allListings.length}`);
  
  if (allListings.length === 0) {
      return { success: true, count: 0, listings: [] };
  }

    // Save to Firestore
    // Pre-flight check: Resolving UUIDs for listings
    // We must check if the externalId already exists to preserve the UUID key
    const listingsToSave = [];
    
    // Process in chunks to avoid blowing up memory or batch limits if N is large
    // But for 5 pages ~100 listings, it's fine. 
    
    // De-duplicate in memory first (just in case same listing on multiple pages)
    const uniqueListings = Array.from(new Map(allListings.map(item => [item.externalId, item])).values());
    
    for (const listing of uniqueListings) {
        // Check if exists by externalId
        const existingSnapshot = await db.collection('market_listings')
            .where('externalId', '==', listing.externalId)
            .limit(1)
            .get();

        let docId;
        if (!existingSnapshot.empty) {
            docId = existingSnapshot.docs[0].id; // Use existing UUID
        } else {
            docId = randomUUID(); // Generate new UUID
        }
        
        listingsToSave.push({ docId, data: listing });
    }

    const batch = db.batch();
    listingsToSave.forEach(item => {
      const ref = db.collection('market_listings').doc(item.docId);
      batch.set(ref, item.data, { merge: true });
    });

    await batch.commit();
    console.log('Saved listings to Firestore');

    return { success: true, count: listingsToSave.length, listings: listingsToSave };


}
