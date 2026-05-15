# Kampaignz Product Specification

## Overview
Kampaignz is a Table Top Campaign Builder/Manager designed as a vibe-coded prototype to assist Game Masters in managing their campaigns. It provides a structured way to track campaigns, players, sessions, and related data, presented in a premium, visually appealing desktop application.

## Tech Stack
- **Framework**: Electron (Desktop Application)
- **Frontend**: React 19, Ant Design (antd)
- **Build Tool**: Vite
- **Database**: SQLite (via `better-sqlite3` native module)
- **Language**: TypeScript
- **Testing**: Vitest

## Architecture
The application follows a standard Electron architecture:
- **Main Process**: Handles database interactions (SQLite), migrations, and IPC handlers.
- **Renderer Process**: The React UI layer, communicating with the Main process via a secure context bridge.
- **Preload**: Defines the `window.api` interface bridging the Renderer and Main processes.

## Data Model & Schema
The database uses a relational model with SQLite. The core entities include:

### 1. Campaigns (`campaigns` table)
The root entity of the application.
- `id`: Primary key
- `name`: Campaign name
- `expectedSessions`: Expected duration of the campaign
- `config`: JSON blob for extensible configuration
- `created_at`: Timestamp

### 2. Players (`players` table)
Participants in a campaign.
- `id`: Primary key
- `campaign_id`: Foreign key to `campaigns`
- `playerName`: Name of the player
- `army`: The player's faction or army details
- `notes`: General notes about the player
- `config`: JSON blob for extensible configuration
- `created_at`: Timestamp

### 3. Sessions (`sessions` table)
Individual events or game sessions within a campaign.
- `id`: Primary key
- `campaign_id`: Foreign key to `campaigns`
- `title`: Session title
- `sessionDetails`: Notes and details about the session
- `map`: Information or link to the map used
- `config`: JSON blob for extensible configuration
- `created_at`: Timestamp

### 4. Session Matches (`session_matches` & related tables)
Detailed tracking of matchups during a session. Matches involve teams (Team A and Team B) made up of players.
- Relates `sessions` to `players` via match entities.
- Supports different match types (e.g., 1v1, 2v2, 4v4).

### 5. Steps (`steps` table)
A structured sequence of events or phases within a campaign. Steps group together multiple sessions and messages.
- `id`: Primary key
- `campaign_id`: Foreign key to `campaigns`
- `title`: Title of the step
- `notes`: Notes for the step
- `config`: JSON blob for extensible configuration
- *Relationships*: Links to `sessions` (via `step_sessions`) and `messages` (via `step_messages`).

### 6. Messages (`messages` table)
Communication related to a campaign, which can be sent to external services like Discord.
- `id`: Primary key
- `campaign_id`: Foreign key to `campaigns`
- `content`: The message content
- `config`: JSON blob for extensible configuration
- *Relationships*: Links to `players` (via `message_players`).

## Key Features & Capabilities
1. **Campaign Management**: Create, list, and view details of different tabletop campaigns.
2. **Player Tracking**: Manage a roster of players, their armies, and specific notes per campaign.
3. **Session Planning**: Log individual game sessions, including maps and detailed descriptions.
4. **Match Tracking**: Record specific matchups between players in a given session.
5. **Campaign Progression (Steps)**: Organize a campaign into logical steps, grouping relevant sessions and communications.
6. **Messaging/Discord Integration**: Generate messages from configurations and send updates directly to Discord.

## UI/UX Guidelines
- **Visuals**: Emphasize a premium, modern design with rich aesthetics (glassmorphism, curated color palettes, micro-animations).
- **Component Library**: Leverage Ant Design for robust, accessible UI components, heavily customized to fit the premium theme.
  - *Note on Ant Design v5 Notifications*: When using `notificationApi`, use `title` instead of `message`, as `message` is deprecated.
  - *Note on Ant Design v5 Components*: The `List` component is deprecated. Use standard HTML `ul` and `li` with flexbox and custom styling instead.
- **Routing**: Lightweight, state-based routing between main views (e.g., `CampaignList`, `CampaignDetails`).

## Extensibility
The heavy use of JSON `config` columns across all major entities (`campaigns`, `players`, `sessions`, `steps`, `messages`) allows the application to easily adapt to different tabletop systems or add new features without requiring constant database schema migrations.
