import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';

const AnalyticsDefault = () => {
    const location = useLocation();

    useEffect(() => {
        // Initialize GA4 once
        // We use the environment variable VITE_GA_MEASUREMENT_ID
        const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
        
        if (gaMeasurementId) {
            ReactGA.initialize(gaMeasurementId);
        } else {
            console.warn('Google Analytics Measurement ID is missing (VITE_GA_MEASUREMENT_ID)');
        }
    }, []);

    useEffect(() => {
        // Send pageview with a custom path
        const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
        if (gaMeasurementId) {
             ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
        }
    }, [location]);

    return null;
};

export default AnalyticsDefault;
