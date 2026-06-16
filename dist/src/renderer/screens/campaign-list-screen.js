"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCampaignListScreen = void 0;
const api_1 = require("../api");
const dom_1 = require("../utils/dom");
const format_1 = require("../utils/format");
const renderCampaignListScreen = async ({ root, router }) => {
    (0, dom_1.mount)(root, `
      <main class="layout">
        <h1>Kampaignz - ${process.env.VITE_DB_CLIENT || 'none'}</h1>
        <form id="create-campaign-form" class="row">
          <input
            id="campaign-name"
            type="text"
            placeholder="New campaign name"
            autocomplete="off"
            required
          />
          <button type="submit">Create</button>
        </form>
        <p id="status" role="status" aria-live="polite"></p>
        <ul id="campaign-list" class="campaign-list"></ul>
      </main>
    `);
    const form = (0, dom_1.queryRequired)('#create-campaign-form');
    const input = (0, dom_1.queryRequired)('#campaign-name');
    const status = (0, dom_1.queryRequired)('#status');
    const list = (0, dom_1.queryRequired)('#campaign-list');
    const renderCampaigns = (campaigns) => {
        list.innerHTML = campaigns
            .map((campaign) => `
          <li>
            <button class="link-button" data-campaign-id="${campaign.id}">${(0, dom_1.escapeHtml)(campaign.name)}</button>
            <span class="date">${(0, format_1.formatDate)(campaign.created_at)}</span>
          </li>
        `)
            .join('');
    };
    const refreshCampaigns = async () => {
        renderCampaigns(await api_1.api.listCampaigns());
    };
    list.addEventListener('click', (event) => {
        const target = event.target;
        const button = target.closest('.link-button');
        if (!button) {
            return;
        }
        const id = Number(button.dataset.campaignId);
        if (Number.isFinite(id)) {
            void router.goToCampaignDetail(id);
        }
    });
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = input.value.trim();
        if (!name) {
            status.textContent = 'Enter a campaign name first.';
            return;
        }
        try {
            await api_1.api.createCampaign(name);
            input.value = '';
            status.textContent = 'Campaign created.';
            await refreshCampaigns();
        }
        catch (error) {
            status.textContent =
                error instanceof Error ? error.message : 'Failed to create campaign.';
        }
    });
    await refreshCampaigns();
};
exports.renderCampaignListScreen = renderCampaignListScreen;
//# sourceMappingURL=campaign-list-screen.js.map