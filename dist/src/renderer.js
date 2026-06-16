"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./index.css");
const router_1 = require("./renderer/router");
const campaign_list_screen_1 = require("./renderer/screens/campaign-list-screen");
const root = document.querySelector('#app');
if (!root) {
    throw new Error('App container not found.');
}
const router = (0, router_1.createRouter)(async (route) => {
    if (route.name === 'campaign-list') {
        await (0, campaign_list_screen_1.renderCampaignListScreen)({ root, router });
        return;
    }
});
void router.goToCampaignList();
//# sourceMappingURL=renderer.js.map