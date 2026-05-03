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
  throw new Error('Failed to initialize UI elements.');
}

const renderCampaigns = (campaigns: Campaign[]) => {
  list.innerHTML = campaigns
    .map(
      (campaign) =>
        `<li><span class="name">${campaign.name}</span><span class="date">${new Date(campaign.created_at).toLocaleString()}</span></li>`,
    )
    .join('');
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

refreshCampaigns().catch(() => {
  status.textContent = 'Failed to load campaigns.';
});
