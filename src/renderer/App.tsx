import React, { useState } from 'react';
import Dashboard from './screens/campaign-details/index';

export default function App() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  return (
    <Dashboard 
      selectedCampaignId={selectedCampaignId} 
      onSelectCampaign={(id) => setSelectedCampaignId(id)} 
    />
  );
}
