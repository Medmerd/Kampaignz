import React, { useState, useEffect, useRef } from 'react';
import CampaignList from './screens/CampaignList';
import CampaignDetails from './screens/campaign-details/index'
import type { Route } from './types';



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
