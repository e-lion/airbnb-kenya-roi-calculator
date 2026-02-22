import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

// Simple UUID generator for the browser
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Get or create a persistent anonymous session ID
export const getSessionId = (): string => {
    let sessionId = localStorage.getItem('kh_session_id');
    if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem('kh_session_id', sessionId);
        
        // Asynchronously register the new session in Firestore
        initSession(sessionId).catch(err => console.error('Failed to init session:', err));
    }
    return sessionId;
};

// Fire-and-forget session initialization
const initSession = async (sessionId: string) => {
    try {
        await addDoc(collection(db, 'analytics_sessions'), {
            sessionId,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timestamp: serverTimestamp(),
            entryUrl: window.location.href,
        });
    } catch (error) {
        console.error('Analytics session error (ignored):', error);
    }
};

interface EventDetails {
    [key: string]: any;
}

// Fire-and-forget event tracking
export const trackEvent = async (eventName: string, details?: EventDetails) => {
    try {
        const sessionId = getSessionId();
        await addDoc(collection(db, 'analytics_events'), {
            sessionId,
            eventName,
            timestamp: serverTimestamp(),
            url: window.location.pathname,
            ...(details && { details })
        });
        
        // Log to console in dev mode
        if (import.meta.env.DEV) {
            console.log(`📊 [Analytics] ${eventName}`, details || '');
        }
    } catch (error) {
        console.error(`Analytics event error [${eventName}] (ignored):`, error);
    }
};
