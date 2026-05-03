import { api } from '../api';
import type { Router } from '../router';
import type { Campaign, Player, PlayerInput } from '../types';
import { escapeHtml, mount, queryRequired } from '../utils/dom';
import { formatDate } from '../utils/format';

type Options = {
  root: HTMLElement;
  router: Router;
  campaignId: number;
};

type TabName = 'campaign' | 'players';

const parseConfig = (raw: string): Record<string, unknown> => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {};
  }

  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Config JSON must be an object.');
  }

  return parsed as Record<string, unknown>;
};

export const renderCampaignDetailScreen = async ({
  root,
  router,
  campaignId,
}: Options) => {
  const campaign = await api.getCampaign(campaignId);
  const players = await api.listPlayersByCampaign(campaignId);

  let activeTab: TabName = 'campaign';
  let selectedPlayerId: number | null = players.length ? players[0].id : null;

  const draw = (stateCampaign: Campaign, statePlayers: Player[]) => {
    const selectedPlayer =
      selectedPlayerId === null
        ? null
        : statePlayers.find((player) => player.id === selectedPlayerId) ?? null;

    mount(
      root,
      `
        <main class="layout">
          <button id="back-button" class="secondary-button">Back to campaigns</button>
          <h1>${escapeHtml(stateCampaign.name)}</h1>
          <p class="meta-row"><strong>ID:</strong> ${stateCampaign.id}</p>
          <p class="meta-row"><strong>Created:</strong> ${formatDate(stateCampaign.created_at)}</p>

          <div class="tabs" role="tablist" aria-label="Campaign sections">
            <button class="tab-button ${activeTab === 'campaign' ? 'is-active' : ''}" data-tab="campaign" role="tab" aria-selected="${activeTab === 'campaign'}">Campaign details</button>
            <button class="tab-button ${activeTab === 'players' ? 'is-active' : ''}" data-tab="players" role="tab" aria-selected="${activeTab === 'players'}">Player details</button>
          </div>

          <section class="tab-panel ${activeTab === 'campaign' ? '' : 'is-hidden'}" data-panel="campaign">
            <form id="campaign-details-form" class="details-form">
              <label for="edit-campaign-name">Name</label>
              <input id="edit-campaign-name" type="text" value="${escapeHtml(stateCampaign.name)}" required />
              <button type="submit">Save changes</button>
            </form>
          </section>

          <section class="tab-panel ${activeTab === 'players' ? '' : 'is-hidden'}" data-panel="players">
            <div class="split">
              <div>
                <h2>Players</h2>
                <button id="new-player-button" class="secondary-button" type="button">New player</button>
                <ul id="player-list" class="campaign-list">
                  ${statePlayers
                    .map(
                      (player) => `
                        <li>
                          <button class="link-button ${selectedPlayerId === player.id ? 'selected-link' : ''}" data-player-id="${player.id}">${escapeHtml(player.playerName)}</button>
                          <span class="date">${escapeHtml(player.army)}</span>
                        </li>
                      `,
                    )
                    .join('')}
                </ul>
              </div>
              <div>
                <h2>${selectedPlayer ? 'Edit player' : 'Create player'}</h2>
                <form id="player-form" class="details-form">
                  <label for="player-name">Player name</label>
                  <input id="player-name" type="text" value="${escapeHtml(selectedPlayer?.playerName ?? '')}" required />
                  <label for="player-army">Army</label>
                  <input id="player-army" type="text" value="${escapeHtml(selectedPlayer?.army ?? '')}" required />
                  <label for="player-notes">Notes</label>
                  <textarea id="player-notes" rows="4">${escapeHtml(selectedPlayer?.notes ?? '')}</textarea>
                  <label for="player-config">Config (JSON object)</label>
                  <textarea id="player-config" rows="4">${escapeHtml(JSON.stringify(selectedPlayer?.config ?? {}, null, 2))}</textarea>
                  <button type="submit">${selectedPlayer ? 'Save player' : 'Create player'}</button>
                </form>
              </div>
            </div>
          </section>

          <p id="details-status" role="status" aria-live="polite"></p>
        </main>
      `,
    );

    const backButton = queryRequired<HTMLButtonElement>('#back-button');
    const status = queryRequired<HTMLParagraphElement>('#details-status');
    const campaignForm = queryRequired<HTMLFormElement>('#campaign-details-form');
    const campaignNameInput = queryRequired<HTMLInputElement>('#edit-campaign-name');
    const tabButtons = root.querySelectorAll<HTMLButtonElement>('.tab-button');
    const playerList = queryRequired<HTMLUListElement>('#player-list');
    const newPlayerButton = queryRequired<HTMLButtonElement>('#new-player-button');
    const playerForm = queryRequired<HTMLFormElement>('#player-form');
    const playerNameInput = queryRequired<HTMLInputElement>('#player-name');
    const playerArmyInput = queryRequired<HTMLInputElement>('#player-army');
    const playerNotesInput = queryRequired<HTMLTextAreaElement>('#player-notes');
    const playerConfigInput = queryRequired<HTMLTextAreaElement>('#player-config');

    backButton.addEventListener('click', () => {
      void router.goToCampaignList();
    });

    for (const button of tabButtons) {
      button.addEventListener('click', () => {
        const nextTab = button.dataset.tab as TabName | undefined;
        if (!nextTab) {
          return;
        }

        activeTab = nextTab;
        draw(stateCampaign, statePlayers);
      });
    }

    campaignForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const updated = await api.updateCampaignName(campaignId, campaignNameInput.value);
        status.textContent = 'Campaign updated.';
        draw(updated, statePlayers);
      } catch (error) {
        status.textContent =
          error instanceof Error ? error.message : 'Failed to update campaign.';
      }
    });

    playerList.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>('.link-button');
      if (!button) {
        return;
      }

      const id = Number(button.dataset.playerId);
      if (!Number.isFinite(id)) {
        return;
      }

      selectedPlayerId = id;
      draw(stateCampaign, statePlayers);
    });

    newPlayerButton.addEventListener('click', () => {
      selectedPlayerId = null;
      draw(stateCampaign, statePlayers);
    });

    playerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const input: PlayerInput = {
          playerName: playerNameInput.value,
          army: playerArmyInput.value,
          notes: playerNotesInput.value,
          config: parseConfig(playerConfigInput.value),
        };

        if (selectedPlayerId === null) {
          const created = await api.createPlayer(campaignId, input);
          selectedPlayerId = created.id;
          status.textContent = 'Player created.';
        } else {
          await api.updatePlayer(selectedPlayerId, input);
          status.textContent = 'Player updated.';
        }

        const refreshedPlayers = await api.listPlayersByCampaign(campaignId);
        draw(stateCampaign, refreshedPlayers);
      } catch (error) {
        status.textContent =
          error instanceof Error ? error.message : 'Failed to save player.';
      }
    });
  };

  draw(campaign, players);
};
