"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouter = void 0;
const createRouter = (onRoute) => {
    const goToCampaignList = () => onRoute({ name: 'campaign-list' });
    const goToCampaignDetail = (campaignId) => onRoute({ name: 'campaign-detail', campaignId });
    return {
        goToCampaignList,
        goToCampaignDetail,
    };
};
exports.createRouter = createRouter;
//# sourceMappingURL=router.js.map