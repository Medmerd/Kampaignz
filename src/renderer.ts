import './index.css';
import { createRouter } from './renderer/router';
import { renderCampaignDetailScreen } from './renderer/screens/campaign-detail-screen';
import { renderCampaignListScreen } from './renderer/screens/campaign-list-screen';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('App container not found.');
}

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
