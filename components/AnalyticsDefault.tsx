import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, getSessionId } from '../services/analyticsService';

const AnalyticsDefault = () => {
    const location = useLocation();

    // Ensure session ID exists when tracking starts
    useEffect(() => {
        getSessionId();
    }, []);

    useEffect(() => {
        // Track unique page views using our custom Firebase system
        trackEvent('page_view', {
            path: location.pathname + location.search
        });
    }, [location]);

    return null;
};

export default AnalyticsDefault;
