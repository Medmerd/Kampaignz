import React, { useState, useEffect, useRef } from 'react';
import CampaignList from './screens/CampaignList';
import CampaignDetails from './screens/campaign-details/index'
import { renderCampaignDetailScreen } from './screens/campaign-detail-screen';
import type { Route } from './types';
import { createRouter } from './router';

// Bridge to legacy vanilla TS detail screen
function LegacyDetailWrapper({ 
  campaignId, 
  onBack 
}: { 
  campaignId: number; 
  onBack: () => void 
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!rootRef.current) return;
    
    // Create a mock router to catch the back navigation from the legacy screen
    const mockRouter = {
      goToCampaignList: onBack,
      goToCampaignDetail: () => {}, // Not needed here
    };

    void renderCampaignDetailScreen({
      root: rootRef.current,
      router: mockRouter,
      campaignId
    });
  }, [campaignId, onBack]);

  return <div ref={rootRef} />;
}

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'campaign-list' });

  if (route.name === 'campaign-list') {
    return (
      <CampaignList 
        onSelectCampaign={(id) => setRoute({ name: 'campaign-detail', campaignId: id })} 
      />
    );
  }

  if (route.name === 'campaign-detail') {
    return (
      <CampaignDetails 
        campaignId={route.campaignId} 
        onBack={() => setRoute({ name: 'campaign-list' })} 
      />
    );
  }

  return <div>Unknown Route</div>;
}
