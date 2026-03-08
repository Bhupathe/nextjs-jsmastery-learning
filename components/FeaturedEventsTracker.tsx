'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

const FeaturedEventsTracker = () => {
  useEffect(() => {
    posthog.capture('featured_events_viewed');
  }, []);

  return null;
};

export default FeaturedEventsTracker;
