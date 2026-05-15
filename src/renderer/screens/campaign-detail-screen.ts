import React from 'react';
import { Empty, Steps, Tabs } from 'antd';
import { createRoot } from 'react-dom/client';
import { api } from '../api';
import type { Router } from '../router';
import type {
  Campaign,
  Message,
  MessageInput,
  Player,
  PlayerInput,
  Session,
  SessionMatch,
  SessionInput,
  Step,
  StepInput,
} from '../types';
import { escapeHtml, mount, queryRequired } from '../utils/dom';
import { formatDate } from '../utils/format';

type Options = {
  root: HTMLElement;
  router: Router;
  campaignId: number;
};

type TabName = 'campaign' | 'players' | 'messages' | 'sessions' | 'steps';

type MatchType = '1' | '2' | '4';

type UiSessionMatch = {
  matchType: MatchType;
  teamAPlayerIds: number[];
  teamBPlayerIds: number[];
};

const teamSizeByMatchType: Record<MatchType, number> = {
  '1': 1,
  '2': 2,
  '4': 4,
};

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

const toUiMatches = (matches: SessionMatch[]): UiSessionMatch[] =>
  matches.map((match) => ({
    matchType: String(match.matchType) as MatchType,
    teamAPlayerIds: match.teamAPlayerIds,
    teamBPlayerIds: match.teamBPlayerIds,
  }));

const toDbMatches = (matches: UiSessionMatch[]): SessionMatch[] =>
  matches.map((match) => ({
    matchType: Number(match.matchType) as 1 | 2 | 4,
    teamAPlayerIds: match.teamAPlayerIds,
    teamBPlayerIds: match.teamBPlayerIds,
  }));

export const renderCampaignDetailScreen = async ({
  root,
  router,
  campaignId,
}: Options) => {
  const campaign = await api.getCampaign(campaignId);
  const players = await api.listPlayersByCampaign(campaignId);
  const messages = await api.listMessagesByCampaign(campaignId);
  const sessions = await api.listSessionsByCampaign(campaignId);
  const steps = await api.listStepsByCampaign(campaignId);
  const sessionMatchesBySessionId = Object.fromEntries(
    await Promise.all(
      sessions.map(async (session) => [
        session.id,
        toUiMatches(await api.listSessionMatches(session.id)),
      ]),
    ),
  ) as Record<number, UiSessionMatch[]>;

  let activeTab: TabName = 'campaign';
  let selectedPlayerId: number | null = players.length ? players[0].id : null;
  let selectedMessageId: number | null = messages.length ? messages[0].id : null;
  let selectedSessionId: number | null = sessions.length ? sessions[0].id : null;
  let selectedStepId: number | null = steps.length ? steps[0].id : null;
  let isSessionModalOpen = false;
  let isGeneratingMessage = false;

  const draw = (
    stateCampaign: Campaign,
    statePlayers: Player[],
    stateMessages: Message[],
    stateSessions: Session[],
    stateSteps: Step[],
  ) => {
    const selectedPlayer =
      selectedPlayerId === null
        ? null
        : statePlayers.find((player) => player.id === selectedPlayerId) ?? null;
    const selectedMessage =
      selectedMessageId === null
        ? null
        : stateMessages.find((message) => message.id === selectedMessageId) ?? null;
    const selectedSession =
      selectedSessionId === null
        ? null
        : stateSessions.find((session) => session.id === selectedSessionId) ?? null;
    const selectedStep =
      selectedStepId === null
        ? null
        : stateSteps.find((step) => step.id === selectedStepId) ?? null;

    mount(
      root,
      `
        <main class="layout">
          <button id="back-button" class="secondary-button">Back to campaigns</button>
          <h1>${escapeHtml(stateCampaign.name)}</h1>
          <p class="meta-row"><strong>ID:</strong> ${stateCampaign.id}</p>
          <p class="meta-row"><strong>Created:</strong> ${formatDate(stateCampaign.created_at)}</p>

          <div id="campaign-detail-tabs"></div>

          <section class="tab-panel ${activeTab === 'campaign' ? '' : 'is-hidden'}" data-panel="campaign">
            <form id="campaign-details-form" class="details-form">
              <label for="edit-campaign-name">Name</label>
              <input id="edit-campaign-name" type="text" value="${escapeHtml(stateCampaign.name)}" required />
              <label for="edit-campaign-expected-sessions">Expected sessions</label>
              <input id="edit-campaign-expected-sessions" type="number" min="1" step="1" value="${stateCampaign.expectedSessions}" required />
              <label for="edit-campaign-config">Config (JSON object)</label>
              <textarea id="edit-campaign-config" rows="4">${escapeHtml(JSON.stringify(stateCampaign.config ?? {}, null, 2))}</textarea>
              <button type="submit">Save changes</button>
            </form>
          </section>

          <section class="tab-panel ${activeTab === 'messages' ? '' : 'is-hidden'}" data-panel="messages">
            <div class="split">
              <div>
                <h2>Messages</h2>
                <button id="new-message-button" class="secondary-button" type="button">New message</button>
                <ul id="message-list" class="campaign-list">
                  ${stateMessages
                    .map(
                      (message) => `
                        <li>
                          <button class="link-button ${selectedMessageId === message.id ? 'selected-link' : ''}" data-message-id="${message.id}">${escapeHtml(message.content.slice(0, 42) || '(empty)')}</button>
                          <span class="date">${formatDate(message.created_at)}</span>
                        </li>
                      `,
                    )
                    .join('')}
                </ul>
              </div>
              <div>
                <h2>${selectedMessage ? 'Edit message' : 'Create message'}</h2>
                <form id="message-form" class="details-form">
                  <label for="message-content">Message</label>
                  <textarea id="message-content" rows="5">${escapeHtml(selectedMessage?.content ?? '')}</textarea>
                  <button id="generate-message-button" class="secondary-button" type="button">Generate Message</button>
                  <button id="send-message-button" class="secondary-button" type="button">Send to Discord</button>
                  <label for="message-config">Config (JSON object)</label>
                  <textarea id="message-config" rows="4">${escapeHtml(JSON.stringify(selectedMessage?.config ?? {}, null, 2))}</textarea>
                  <label for="message-player-ids">Players</label>
                  <select id="message-player-ids" multiple size="8">
                    ${statePlayers
                      .map((player) => {
                        const selected = selectedMessage?.player_ids.includes(player.id)
                          ? 'selected'
                          : '';
                        return `<option value="${player.id}" ${selected}>${escapeHtml(player.playerName)} (${escapeHtml(player.army)})</option>`;
                      })
                      .join('')}
                  </select>
                  <button id="clear-message-players" class="secondary-button" type="button">Clear player selection</button>
                  <button type="submit">${selectedMessage ? 'Save message' : 'Create message'}</button>
                </form>
              </div>
            </div>
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

          <section class="tab-panel ${activeTab === 'sessions' ? '' : 'is-hidden'}" data-panel="sessions">
            <h2>Sessions</h2>
            <button id="new-session-button" class="secondary-button" type="button">New session</button>
            <ul id="session-list" class="campaign-list">
              ${stateSessions
                .map(
                  (session) => `
                    <li>
                      <span class="name">${escapeHtml(session.title)}</span>
                      <span class="date">${formatDate(session.created_at)}</span>
                      <button class="secondary-button compact-button" data-session-id="${session.id}">Edit</button>
                    </li>
                  `,
                )
                .join('')}
            </ul>

            <div class="modal-backdrop ${isSessionModalOpen ? '' : 'is-hidden'}" id="session-modal-backdrop">
              <div class="modal-card">
                <h2>${selectedSession ? 'Edit session' : 'Create session'}</h2>
                <form id="session-form" class="details-form">
                  <label for="session-title">Title</label>
                  <input id="session-title" type="text" value="${escapeHtml(selectedSession?.title ?? '')}" required />
                  <div class="twocolumns">
                    <div class="frame">
                      <label for="session-details">Session details</label>
                      <textarea id="session-details" rows="4">${escapeHtml(selectedSession?.sessionDetails ?? '')}</textarea>
                      <label for="session-map">Map</label>
                      <textarea id="session-map" rows="3">${escapeHtml(selectedSession?.map ?? '')}</textarea>
                      <label for="session-config">Config (JSON object)</label>
                      <textarea id="session-config" rows="4">${escapeHtml(JSON.stringify(selectedSession?.config ?? {}, null, 2))}</textarea>
                    </div>
                    <div class="frame">
                      <h3>Match builder</h3>
                      <div id="session-match-builder-controls">
                        <label for="session-match-type">Match type</label>
                        <select id="session-match-type">
                          <option value="1">1 vs 1</option>
                          <option value="2">2 vs 2</option>
                          <option value="4">4 vs 4</option>
                        </select>
                        <button id="generate-session-matches" class="secondary-button" type="button">Generate Matches</button>
                        <label for="session-match-team-a">Team A players</label>
                        <select id="session-match-team-a" multiple size="6"></select>
                        <label for="session-match-team-b">Team B players</label>
                        <select id="session-match-team-b" multiple size="6"></select>
                        <button id="add-session-match" class="secondary-button" type="button">Add match</button>
                      </div>
                      <ul id="session-match-list" class="campaign-list"></ul>
                      <p><strong>Unmatched players</strong></p>
                      <ul id="session-unmatched-list" class="campaign-list"></ul>
                    </div>
                  </div>
                  <div class="row">
                    <button id="cancel-session-modal" class="secondary-button" type="button">Cancel</button>
                    <button type="submit">${selectedSession ? 'Save session' : 'Create session'}</button>
                  </div>
                </form>
              </div>
            </div>
          </section>

          <section class="tab-panel ${activeTab === 'steps' ? '' : 'is-hidden'}" data-panel="steps">
            <div class="split">
              <div>
                <h2>Campaign Steps</h2>
                <button id="new-step-button" class="secondary-button" type="button">New step</button>
                <div id="steps-control"></div>
              </div>
              <div>
                <h2>${selectedStep ? 'Edit step' : 'Create step'}</h2>
                <form id="step-form" class="details-form">
                  <label for="step-title">Title</label>
                  <input id="step-title" type="text" value="${escapeHtml(selectedStep?.title ?? '')}" required />
                  <label for="step-session-ids">Sessions</label>
                  <select id="step-session-ids" multiple size="8">
                    ${stateSessions
                      .map((session) => {
                        const selected = selectedStep?.session_ids.includes(session.id)
                          ? 'selected'
                          : '';
                        return `<option value="${session.id}" ${selected}>${escapeHtml(session.title)}</option>`;
                      })
                      .join('')}
                  </select>
                  <label for="step-notes">Notes</label>
                  <textarea id="step-notes" rows="4">${escapeHtml(selectedStep?.notes ?? '')}</textarea>
                  <label for="step-config">Config (JSON object)</label>
                  <textarea id="step-config" rows="4">${escapeHtml(JSON.stringify(selectedStep?.config ?? {}, null, 2))}</textarea>
                  <button type="submit">${selectedStep ? 'Save step' : 'Create step'}</button>
                </form>
              </div>
            </div>
          </section>

          <p id="details-status" role="status" aria-live="polite"></p>
          <div id="generating-indicator" class="spinner-row ${isGeneratingMessage ? '' : 'is-hidden'}" aria-live="polite">
            <span class="spinner"></span>
            <span>Generating message with Gemini...</span>
          </div>
        </main>
      `,
    );

    const backButton = queryRequired<HTMLButtonElement>('#back-button');
    const status = queryRequired<HTMLParagraphElement>('#details-status');
    const campaignForm = queryRequired<HTMLFormElement>('#campaign-details-form');
    const campaignNameInput = queryRequired<HTMLInputElement>('#edit-campaign-name');
    const campaignExpectedSessionsInput = queryRequired<HTMLInputElement>(
      '#edit-campaign-expected-sessions',
    );
    const campaignConfigInput = queryRequired<HTMLTextAreaElement>('#edit-campaign-config');
    const tabsHost = queryRequired<HTMLDivElement>('#campaign-detail-tabs');
    const playerList = queryRequired<HTMLUListElement>('#player-list');
    const newPlayerButton = queryRequired<HTMLButtonElement>('#new-player-button');
    const playerForm = queryRequired<HTMLFormElement>('#player-form');
    const playerNameInput = queryRequired<HTMLInputElement>('#player-name');
    const playerArmyInput = queryRequired<HTMLInputElement>('#player-army');
    const playerNotesInput = queryRequired<HTMLTextAreaElement>('#player-notes');
    const playerConfigInput = queryRequired<HTMLTextAreaElement>('#player-config');

    backButton.addEventListener('click', () => {
      if (blockNavigationIfGenerating()) {
        return;
      }

      void router.goToCampaignList();
    });

    createRoot(tabsHost).render(
      React.createElement(Tabs, {
        activeKey: activeTab,
        onChange: (nextTab: string) => {
          if (blockNavigationIfGenerating()) {
            return;
          }

          if (
            nextTab === 'campaign' ||
            nextTab === 'players' ||
            nextTab === 'messages' ||
            nextTab === 'sessions' ||
            nextTab === 'steps'
          ) {
            activeTab = nextTab;
            draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
          }
        },
        items: [
          { key: 'campaign', label: 'Campaign details' },
          { key: 'players', label: 'Player details' },
          { key: 'messages', label: 'Messages' },
          { key: 'sessions', label: 'Sessions' },
          { key: 'steps', label: 'Steps' },
        ],
      }),
    );

    const stepsHost = queryRequired<HTMLDivElement>('#steps-control');
    const newStepButton = queryRequired<HTMLButtonElement>('#new-step-button');
    const stepForm = queryRequired<HTMLFormElement>('#step-form');
    const stepTitleInput = queryRequired<HTMLInputElement>('#step-title');
    const stepSessionIdsInput = queryRequired<HTMLSelectElement>('#step-session-ids');
    const stepNotesInput = queryRequired<HTMLTextAreaElement>('#step-notes');
    const stepConfigInput = queryRequired<HTMLTextAreaElement>('#step-config');
    createRoot(stepsHost).render(
      stateSteps.length === 0
        ? React.createElement(Empty, {
            description: 'No steps for this campaign yet',
          })
        : React.createElement(Steps, {
            direction: 'vertical',
            current:
              selectedStepId === null
                ? stateSteps.length - 1
                : Math.max(
                    0,
                    stateSteps.findIndex((step) => step.id === selectedStepId),
                  ),
            onChange: (currentIndex: number) => {
              if (blockNavigationIfGenerating()) {
                return;
              }

              const nextStep = stateSteps[currentIndex];
              if (!nextStep) {
                return;
              }

              selectedStepId = nextStep.id;
              draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
            },
            items: stateSteps.map((step) => ({
              status: step.session_ids.length > 0 ? undefined : 'error',
              title: step.title,
              subTitle: step.session_ids.length > 0 ? undefined : 'Not initialized',
              description: step.notes || `Created ${formatDate(step.created_at)}`,
            })),
          }),
    );

    newStepButton.addEventListener('click', () => {
      if (blockNavigationIfGenerating()) {
        return;
      }

      selectedStepId = null;
      draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
    });

    stepForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const input: StepInput = {
          title: stepTitleInput.value,
          sessionIds: Array.from(stepSessionIdsInput.selectedOptions)
            .map((option) => Number(option.value))
            .filter(Number.isFinite),
          notes: stepNotesInput.value,
          config: parseConfig(stepConfigInput.value),
        };

        if (selectedStepId === null) {
          const created = await api.createStep(campaignId, input);
          selectedStepId = created.id;
          status.textContent = 'Step created.';
        } else {
          await api.updateStep(selectedStepId, input);
          status.textContent = 'Step updated.';
        }

        const refreshedSteps = await api.listStepsByCampaign(campaignId);
        draw(stateCampaign, statePlayers, stateMessages, stateSessions, refreshedSteps);
      } catch (error) {
        status.textContent =
          error instanceof Error ? error.message : 'Failed to save step.';
      }
    });

    campaignForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const updated = await api.updateCampaignDetails(campaignId, {
          name: campaignNameInput.value,
          expectedSessions: Number(campaignExpectedSessionsInput.value),
          config: parseConfig(campaignConfigInput.value),
        });
        status.textContent = 'Campaign updated.';
        draw(updated, statePlayers, stateMessages, stateSessions, stateSteps);
      } catch (error) {
        status.textContent =
          error instanceof Error ? error.message : 'Failed to update campaign.';
      }
    });

    playerList.addEventListener('click', (event) => {
      if (blockNavigationIfGenerating()) {
        return;
      }

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
      draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
    });

    newPlayerButton.addEventListener('click', () => {
      if (blockNavigationIfGenerating()) {
        return;
      }

      selectedPlayerId = null;
      draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
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

        const [refreshedPlayers, refreshedMessages, refreshedSessions, refreshedSteps] = await Promise.all([
          api.listPlayersByCampaign(campaignId),
          api.listMessagesByCampaign(campaignId),
          api.listSessionsByCampaign(campaignId),
          api.listStepsByCampaign(campaignId),
        ]);
        draw(
          stateCampaign,
          refreshedPlayers,
          refreshedMessages,
          refreshedSessions,
          refreshedSteps,
        );
      } catch (error) {
        status.textContent =
          error instanceof Error ? error.message : 'Failed to save player.';
      }
    });

    const sessionList = queryRequired<HTMLUListElement>('#session-list');
    const newSessionButton = queryRequired<HTMLButtonElement>('#new-session-button');
    const sessionModalBackdrop = queryRequired<HTMLDivElement>('#session-modal-backdrop');
    const cancelSessionModalButton = queryRequired<HTMLButtonElement>('#cancel-session-modal');
    const sessionForm = queryRequired<HTMLFormElement>('#session-form');
    const sessionTitleInput = queryRequired<HTMLInputElement>('#session-title');
    const sessionDetailsInput = queryRequired<HTMLTextAreaElement>('#session-details');
    const sessionMapInput = queryRequired<HTMLTextAreaElement>('#session-map');
    const sessionConfigInput = queryRequired<HTMLTextAreaElement>('#session-config');
    const sessionMatchTypeInput = queryRequired<HTMLSelectElement>('#session-match-type');
    const sessionMatchBuilderControls = queryRequired<HTMLDivElement>(
      '#session-match-builder-controls',
    );
    const generateSessionMatchesButton = queryRequired<HTMLButtonElement>(
      '#generate-session-matches',
    );
    const sessionMatchTeamAInput = queryRequired<HTMLSelectElement>('#session-match-team-a');
    const sessionMatchTeamBInput = queryRequired<HTMLSelectElement>('#session-match-team-b');
    const addSessionMatchButton = queryRequired<HTMLButtonElement>('#add-session-match');
    const sessionMatchList = queryRequired<HTMLUListElement>('#session-match-list');
    const sessionUnmatchedList = queryRequired<HTMLUListElement>('#session-unmatched-list');

    let draftSessionMatches: UiSessionMatch[] = selectedSession
      ? [...(sessionMatchesBySessionId[selectedSession.id] ?? [])]
      : [];

    const getUsedPlayerIds = () =>
      new Set(
        draftSessionMatches.flatMap((match) => [
          ...match.teamAPlayerIds,
          ...match.teamBPlayerIds,
        ]),
      );

    const getAvailablePlayers = () => {
      const used = getUsedPlayerIds();
      return statePlayers.filter((player) => !used.has(player.id));
    };

    const renderSessionMatchList = () => {
      sessionMatchList.innerHTML = draftSessionMatches
        .map((match, index) => {
          const toName = (id: number) =>
            statePlayers.find((player) => player.id === id)?.playerName ?? `#${id}`;
          const teamA = match.teamAPlayerIds.map(toName).join(', ');
          const teamB = match.teamBPlayerIds.map(toName).join(', ');
          const label = `${match.matchType}v${match.matchType}`;

          return `
            <li>
              <span class="name">${label}: ${escapeHtml(teamA)} vs ${escapeHtml(teamB)}</span>
              <button class="secondary-button compact-button" data-remove-match-index="${index}" type="button">Remove</button>
            </li>
          `;
        })
        .join('');
    };

    const renderUnmatchedPlayers = () => {
      const unmatched = getAvailablePlayers();

      sessionUnmatchedList.innerHTML = unmatched.length
        ? unmatched
            .map(
              (player) =>
                `<li><span class="name">${escapeHtml(player.playerName)}</span><span class="date">${escapeHtml(player.army)}</span></li>`,
            )
            .join('')
        : '<li><span class="name">All players assigned</span></li>';
    };

    const renderMatchSelectors = () => {
      const available = getAvailablePlayers();
      const options = available
        .map(
          (player) =>
            `<option value="${player.id}">${escapeHtml(player.playerName)} (${escapeHtml(player.army)})</option>`,
        )
        .join('');

      sessionMatchTeamAInput.innerHTML = options;
      sessionMatchTeamBInput.innerHTML = options;
    };

    const refreshMatchBuilder = () => {
      renderSessionMatchList();
      renderUnmatchedPlayers();
      renderMatchSelectors();

      const allPlayersMatched = getAvailablePlayers().length === 0;
      sessionMatchBuilderControls.classList.toggle('is-hidden', allPlayersMatched);
    };

    refreshMatchBuilder();

    sessionList.addEventListener('click', (event) => {
      if (blockNavigationIfGenerating()) {
        return;
      }

      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>('button[data-session-id]');
      if (!button) {
        return;
      }

      const id = Number(button.dataset.sessionId);
      if (!Number.isFinite(id)) {
        return;
      }

      selectedSessionId = id;
      isSessionModalOpen = true;
      draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
    });

    newSessionButton.addEventListener('click', () => {
      if (blockNavigationIfGenerating()) {
        return;
      }

      selectedSessionId = null;
      isSessionModalOpen = true;
      draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
    });

    cancelSessionModalButton.addEventListener('click', () => {
      isSessionModalOpen = false;
      draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
    });

    sessionModalBackdrop.addEventListener('click', (event) => {
      if (event.target !== sessionModalBackdrop) {
        return;
      }

      isSessionModalOpen = false;
      draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
    });

    sessionMatchList.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>('button[data-remove-match-index]');
      if (!button) {
        return;
      }

      const index = Number(button.dataset.removeMatchIndex);
      if (!Number.isFinite(index)) {
        return;
      }

      draftSessionMatches = draftSessionMatches.filter((_, i) => i !== index);
      refreshMatchBuilder();
    });

    generateSessionMatchesButton.addEventListener('click', () => {
      const matchType = sessionMatchTypeInput.value as MatchType;
      const teamSize = teamSizeByMatchType[matchType];

      if (!teamSize) {
        status.textContent = 'Invalid match type.';
        return;
      }

      const players = getAvailablePlayers();
      const playersPerMatch = teamSize * 2;
      const matchCount = Math.floor(players.length / playersPerMatch);

      if (matchCount === 0) {
        status.textContent = 'Not enough unmatched players for this match type.';
        return;
      }

      for (let i = 0; i < matchCount; i += 1) {
        const base = i * playersPerMatch;
        const teamAPlayerIds = players
          .slice(base, base + teamSize)
          .map((player) => player.id);
        const teamBPlayerIds = players
          .slice(base + teamSize, base + playersPerMatch)
          .map((player) => player.id);

        draftSessionMatches.push({
          matchType,
          teamAPlayerIds,
          teamBPlayerIds,
        });
      }

      refreshMatchBuilder();
      status.textContent = `Generated ${matchCount} ${matchType}v${matchType} matches.`;
    });

    addSessionMatchButton.addEventListener('click', () => {
      const matchType = sessionMatchTypeInput.value as MatchType;
      const teamSize = teamSizeByMatchType[matchType];

      if (!teamSize) {
        status.textContent = 'Invalid match type.';
        return;
      }

      const teamAPlayerIds = Array.from(sessionMatchTeamAInput.selectedOptions)
        .map((option) => Number(option.value))
        .filter(Number.isFinite);
      const teamBPlayerIds = Array.from(sessionMatchTeamBInput.selectedOptions)
        .map((option) => Number(option.value))
        .filter(Number.isFinite);

      if (teamAPlayerIds.length !== teamSize || teamBPlayerIds.length !== teamSize) {
        status.textContent = `Select exactly ${teamSize} players per team for ${matchType}v${matchType}.`;
        return;
      }

      const combinedCurrent = [...teamAPlayerIds, ...teamBPlayerIds];
      if (new Set(combinedCurrent).size !== combinedCurrent.length) {
        status.textContent = 'A player cannot be selected more than once in a match.';
        return;
      }

      const alreadyUsed = getUsedPlayerIds();
      const duplicate = combinedCurrent.find((id) => alreadyUsed.has(id));
      if (duplicate) {
        status.textContent = 'A player cannot be selected more than once in this session.';
        return;
      }

      draftSessionMatches.push({
        matchType,
        teamAPlayerIds,
        teamBPlayerIds,
      });
      refreshMatchBuilder();
      status.textContent = 'Match added.';
    });

    sessionForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const input: SessionInput = {
          title: sessionTitleInput.value,
          config: parseConfig(sessionConfigInput.value),
          sessionDetails: sessionDetailsInput.value,
          map: sessionMapInput.value,
        };

        if (selectedSessionId === null) {
          const created = await api.createSession(campaignId, input);
          selectedSessionId = created.id;
          await api.replaceSessionMatches(created.id, toDbMatches(draftSessionMatches));
          sessionMatchesBySessionId[created.id] = [...draftSessionMatches];
          status.textContent = 'Session created.';
        } else {
          await api.updateSession(selectedSessionId, input);
          await api.replaceSessionMatches(
            selectedSessionId,
            toDbMatches(draftSessionMatches),
          );
          sessionMatchesBySessionId[selectedSessionId] = [...draftSessionMatches];
          status.textContent = 'Session updated.';
        }

        isSessionModalOpen = false;

        const refreshedSessions = await api.listSessionsByCampaign(campaignId);
        const refreshedSteps = await api.listStepsByCampaign(campaignId);
        draw(stateCampaign, statePlayers, stateMessages, refreshedSessions, refreshedSteps);
      } catch (error) {
        status.textContent =
          error instanceof Error ? error.message : 'Failed to save session.';
      }
    });

    const messageList = queryRequired<HTMLUListElement>('#message-list');
    const newMessageButton = queryRequired<HTMLButtonElement>('#new-message-button');
    const messageForm = queryRequired<HTMLFormElement>('#message-form');
    const messageContentInput = queryRequired<HTMLTextAreaElement>('#message-content');
    const generateMessageButton = queryRequired<HTMLButtonElement>('#generate-message-button');
    const sendMessageButton = queryRequired<HTMLButtonElement>('#send-message-button');
    const messageConfigInput = queryRequired<HTMLTextAreaElement>('#message-config');
    const messagePlayerIdsInput = queryRequired<HTMLSelectElement>('#message-player-ids');
    const clearMessagePlayersButton = queryRequired<HTMLButtonElement>('#clear-message-players');

    const blockNavigationIfGenerating = () => {
      if (!isGeneratingMessage) {
        return false;
      }

      status.textContent = 'Please wait until message generation finishes.';
      return true;
    };

    messageList.addEventListener('click', (event) => {
      if (blockNavigationIfGenerating()) {
        return;
      }

      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>('.link-button');
      if (!button) {
        return;
      }

      const id = Number(button.dataset.messageId);
      if (!Number.isFinite(id)) {
        return;
      }

      selectedMessageId = id;
      draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
    });

    newMessageButton.addEventListener('click', () => {
      if (blockNavigationIfGenerating()) {
        return;
      }

      selectedMessageId = null;
      draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
    });

    clearMessagePlayersButton.addEventListener('click', () => {
      for (const option of Array.from(messagePlayerIdsInput.options)) {
        option.selected = false;
      }
    });

    generateMessageButton.addEventListener('click', async () => {
      try {
        if (messageContentInput.value.trim()) {
          const shouldReplace = window.confirm(
            'This will replace the current message content. Continue?',
          );

          if (!shouldReplace) {
            return;
          }
        }

        const config = parseConfig(messageConfigInput.value);

        isGeneratingMessage = true;
        draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);

        const generated = await api.generateMessageFromConfig(config);

        isGeneratingMessage = false;
        draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);

        const refreshedMessageContentInput =
          queryRequired<HTMLTextAreaElement>('#message-content');
        const refreshedStatus = queryRequired<HTMLParagraphElement>('#details-status');
        refreshedMessageContentInput.value = generated;
        refreshedStatus.textContent = 'Message generated.';
      } catch (error) {
        isGeneratingMessage = false;
        draw(stateCampaign, statePlayers, stateMessages, stateSessions, stateSteps);
        const refreshedStatus = queryRequired<HTMLParagraphElement>('#details-status');
        refreshedStatus.textContent =
          error instanceof Error ? error.message : 'Failed to generate message.';
      }
    });

    sendMessageButton.addEventListener('click', async () => {
      const content = messageContentInput.value.trim();

      if (!content) {
        status.textContent = 'Message cannot be blank when sending to Discord.';
        return;
      }

      try {
        await api.sendMessageToDiscord(content);
        status.textContent = 'Message sent to Discord.';
      } catch (error) {
        status.textContent =
          error instanceof Error ? error.message : 'Failed to send message to Discord.';
      }
    });

    messageForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const selectedOptions = Array.from(messagePlayerIdsInput.selectedOptions);
        const input: MessageInput = {
          content: messageContentInput.value,
          config: parseConfig(messageConfigInput.value),
          playerIds: selectedOptions
            .map((option) => Number(option.value))
            .filter(Number.isFinite),
        };

        if (selectedMessageId === null) {
          const created = await api.createMessage(campaignId, input);
          selectedMessageId = created.id;
          status.textContent = 'Message created.';
        } else {
          await api.updateMessage(selectedMessageId, input);
          status.textContent = 'Message updated.';
        }

        const refreshedMessages = await api.listMessagesByCampaign(campaignId);
        const refreshedSessions = await api.listSessionsByCampaign(campaignId);
        const refreshedSteps = await api.listStepsByCampaign(campaignId);
        draw(stateCampaign, statePlayers, refreshedMessages, refreshedSessions, refreshedSteps);
      } catch (error) {
        status.textContent =
          error instanceof Error ? error.message : 'Failed to save message.';
      }
    });
  };

  draw(campaign, players, messages, sessions, steps);
};
