import { api } from '../api';
import type { Router } from '../router';
import type { Campaign } from '../types';
import { mount, queryRequired, escapeHtml } from '../utils/dom';
import { formatDate } from '../utils/format';

type Options = {
  root: HTMLElement;
  router: Router;
};

export const renderCampaignListScreen = async ({ root, router }: Options) => {
  mount(
    root,
    `
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
    `,
  );

  const form = queryRequired<HTMLFormElement>('#create-campaign-form');
  const input = queryRequired<HTMLInputElement>('#campaign-name');
  const status = queryRequired<HTMLParagraphElement>('#status');
  const list = queryRequired<HTMLUListElement>('#campaign-list');

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
  };

  const refreshCampaigns = async () => {
    renderCampaigns(await api.listCampaigns());
  };

  list.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('.link-button');

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
      await api.createCampaign(name);
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
