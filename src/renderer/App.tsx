import { useEffect, useRef } from 'react';
import { createRouter } from './router';
import { renderCampaignDetailScreen } from './screens/campaign-detail-screen';
import { renderCampaignListScreen } from './screens/campaign-list-screen';

export default function App() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const root = rootRef.current;
    const router = createRouter(async (route) => {
      if (route.name === 'campaign-list') {
        await renderCampaignListScreen({ root, router });
        return;
      }

      await renderCampaignDetailScreen({
        root,
        router,
        campaignId: route.campaignId,
      });
    });

    void router.goToCampaignList();
  }, []);

  return <div ref={rootRef} />;
}
