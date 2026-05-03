/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

type Campaign = {
  id: number;
  name: string;
  created_at: string;
};

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found.');
}

const formatDate = (value: string) => new Date(value).toLocaleString();
const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderCampaignListScreen = async () => {
  app.innerHTML = `
    <main class="layout">
      <h1>Kampaignz</h1>
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
  `;

  const form = document.querySelector<HTMLFormElement>('#create-campaign-form');
  const input = document.querySelector<HTMLInputElement>('#campaign-name');
  const list = document.querySelector<HTMLUListElement>('#campaign-list');
  const status = document.querySelector<HTMLParagraphElement>('#status');

  if (!form || !input || !list || !status) {
    throw new Error('Failed to initialize campaign list screen.');
  }

  const renderCampaigns = (campaigns: Campaign[]) => {
    list.innerHTML = campaigns
      .map(
        (campaign) => `
          <li>
            <button class="link-button" data-campaign-id="${campaign.id}">${escapeHtml(campaign.name)}</button>
            <span class="date">${formatDate(campaign.created_at)}</span>
          </li>
        `,
      )
      .join('');

    for (const button of list.querySelectorAll<HTMLButtonElement>('.link-button')) {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.campaignId);
        renderCampaignDetailScreen(id).catch(() => {
          status.textContent = 'Failed to open campaign details.';
        });
      });
    }
  };

  const refreshCampaigns = async () => {
    const campaigns = await window.api.listCampaigns();
    renderCampaigns(campaigns);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = input.value.trim();

    if (!name) {
      status.textContent = 'Enter a campaign name first.';
      return;
    }

    try {
      await window.api.createCampaign(name);
      input.value = '';
      status.textContent = 'Campaign created.';
      await refreshCampaigns();
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : 'Failed to create campaign.';
    }
  });

  await refreshCampaigns();
};

const renderCampaignDetailScreen = async (campaignId: number) => {
  const campaign = await window.api.getCampaign(campaignId);

  app.innerHTML = `
    <main class="layout">
      <button id="back-button" class="secondary-button">Back to campaigns</button>
      <h1>Campaign Details</h1>
      <p class="meta-row"><strong>ID:</strong> ${campaign.id}</p>
      <p class="meta-row"><strong>Created:</strong> ${formatDate(campaign.created_at)}</p>
      <form id="campaign-details-form" class="details-form">
        <label for="edit-campaign-name">Name</label>
        <input id="edit-campaign-name" type="text" value="${escapeHtml(campaign.name)}" required />
        <button type="submit">Save changes</button>
      </form>
      <p id="details-status" role="status" aria-live="polite"></p>
    </main>
  `;

  const backButton = document.querySelector<HTMLButtonElement>('#back-button');
  const form = document.querySelector<HTMLFormElement>('#campaign-details-form');
  const input = document.querySelector<HTMLInputElement>('#edit-campaign-name');
  const status = document.querySelector<HTMLParagraphElement>('#details-status');

  if (!backButton || !form || !input || !status) {
    throw new Error('Failed to initialize campaign detail screen.');
  }

  backButton.addEventListener('click', () => {
    renderCampaignListScreen().catch(() => {
      if (status) {
        status.textContent = 'Failed to load campaigns.';
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const updatedName = input.value.trim();

    if (!updatedName) {
      status.textContent = 'Campaign name cannot be empty.';
      return;
    }

    try {
      const updatedCampaign = await window.api.updateCampaignName(
        campaign.id,
        updatedName,
      );
      input.value = updatedCampaign.name;
      status.textContent = 'Campaign updated.';
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : 'Failed to update campaign.';
    }
  });
};

renderCampaignListScreen().catch(() => {
  app.innerHTML = '<main class="layout"><p>Failed to load campaigns.</p></main>';
});
