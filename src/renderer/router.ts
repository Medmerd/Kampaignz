import type { Route } from './types';

type OnRoute = (route: Route) => void | Promise<void>;

export const createRouter = (onRoute: OnRoute) => {
  const goToCampaignList = () => onRoute({ name: 'campaign-list' });
  const goToCampaignDetail = (campaignId: number) =>
    onRoute({ name: 'campaign-detail', campaignId });

  return {
    goToCampaignList,
    goToCampaignDetail,
  };
};

export type Router = ReturnType<typeof createRouter>;
