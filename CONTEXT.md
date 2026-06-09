# Kampaignz Domain Context

Welcome to the Kampaignz domain definition and architectural guide. This document maps out our core tabletop campaign manager domain, defines canonical terms, and details architecture patterns.

## Domain Glossary

Our domain is focused on Table Top Campaign Management (e.g., Warhammer, D&D, or other tabletop systems).

### Campaign
The root entity representing a tabletop campaign. It organizes players, sessions, missions, and messages.
- **Attributes**: Name, Expected Sessions (intended duration of the campaign in play sessions), custom config.

### Player
A participant in a Campaign.
- **Attributes**: Player Name, Army (faction/details), custom notes, config.

### Army Rules (Abstract Rulebook)
A collection of rules (Detachments, Enhancements, Stratagems, Crusade Rules, etc.) representing a tabletop faction's capabilities. It can be shared across campaigns and assigned to players as their source of truth for faction mechanics.

### Army
A specific player's curated roster of units, models, and wargear that they bring to the table. Reserved strictly for lists, not abstract rulesets.

### Session
A chronological RPG game session run by the Game Master (e.g., "Session 1", "Session 2"). A Session acts as a broad container that can track any number of activities occurring during game night:
- Contains 0 to many **Missions** (games/battles played).
- Contains 0 to many **Messages** logged or sent to external services.
- Contains general session details, map info, and participants.
- *Historical Note:* Previously modeled as a **Step** (via the `steps` database table and `Step` code types). Standardized to **Session** in the domain layer.

### Mission
An individual tactical game, battle, skirmish, or scenario played during a session.
- **Attributes**: Title, Mission Details (notes/briefing), Map, config.
- *Historical Note:* Stored in the `missions` database table. Previously called a "Session" in legacy preload, types, and backend repositories. Standardized to **Mission** across all software layers to avoid confusion with the chronological **Session**.

### Mission Match (or Match)
A matchup between teams of players occurring within a specific **Mission**.
- **Attributes**: Match Type (e.g., 1v1, 2v2, 4v4), Team A players, Team B players.

### Message
Communication or logs related to campaign events (e.g., battle reports, session start announcements) that can be sent to external services like Discord.
- **Attributes**: Content, linked Players, config.

---

## Architectural Decisions

### 1. Hybrid Database Architecture (SQLite & PostgreSQL)
Kampaignz supports a hybrid database approach using **Knex.js** as the query builder:
- **Local Desktop Execution**: When running as an Electron desktop application, it uses **SQLite** (via `better-sqlite3` or `sqlite3`) for self-contained, offline-first local file storage.
- **Web App Execution**: To support the long-term goal of deploying the application as a pod-based Web application, it supports **PostgreSQL** (via the `pg` client).
- **Environment Selection**: The database client is determined at runtime via the `VITE_DB_CLIENT` environment variable. It defaults to SQLite (`development`) for local execution, but can be set to `devpostgresql`, `staging`, or `production` to connect to a PostgreSQL instance.

### 2. Symmetrical Communication Bridge (RPC-over-HTTP Mirror)
To support both desktop (Electron) and web (pod-based) environments without duplicating code, we employ a symmetrical gateway abstraction:
- **Electron Mode (IPC)**: The React frontend uses the native Electron IPC channel context bridge (`window.api`). This leverages fast, secure, native memory-channel messaging.
- **Web App Mode (RPC-over-HTTP)**: If the app is executed in a standard browser environment (where `window.api` is undefined), the API client automatically falls back to an **RPC-over-HTTP Mirror**. It sends `POST /api/rpc` payloads detailing the RPC channel (e.g. `missions:create`) and arguments.
- **Backend Symmetries**: A unified server-side entry point maps the received RPC channel and arguments directly to the exact same repository layer functions that the IPC handlers use. This ensures 100% logic and type sharing between both standalone web and desktop builds.


