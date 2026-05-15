# Agents Guide - Kampaignz

Welcome to the Kampaignz development team. This document outlines the project's architecture, mission, and guidelines for AI agents working on this codebase.

## Project Mission
Kampaignz is a Table Top Campaign Builder/Manager designed to assist Game Masters in managing their campaigns with ease and style. It aims to provide a premium, interactive, and visually stunning experience for campaign planning and tracking.

## Technology Stack
- **Framework**: [Electron](https://www.electronjs.org/) (Desktop Application)
- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Library**: [Ant Design (antd)](https://ant.design/)
- **Database**: [SQLite](https://www.sqlite.org/) (via `better-sqlite3`)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Testing**: [Vitest](https://vitest.dev/)

## Architecture Overview
- **Main Process (`src/main`)**: Handles system-level operations, database management, and IPC communication.
- **Renderer Process (`src/renderer`)**: The React-based UI layer.
- **Preload Scripts (`src/preload.ts`)**: Securely bridges the Main and Renderer processes.
- **IPC Bridge**: Communication between UI and Backend happens via `window.api` (defined in `preload.ts` and used in `src/renderer/api.ts`).

## Agent Guidelines

### 1. Visual Excellence & Aesthetics
Kampaignz is not just a tool; it's an experience.
- **Premium Design**: Always prioritize high-end, modern UI. Use Ant Design's power but customize it with premium styling.
- **Rich Aesthetics**: Use glassmorphism, subtle animations, and curated color palettes.
- **Responsive Layouts**: Ensure the UI feels fluid and reactive.

### 2. Code Quality & Patterns
- **Functional Components**: Use React functional components with hooks.
- **IPC Pattern**: Always use the established IPC pattern for backend calls. Do not bypass the bridge.
- **Database Access**: Perform database operations in the Main process via services and repositories.
- **Type Safety**: Maintain strict TypeScript typing across the bridge and within components.

### 3. Testing & Validation
- **Vitest**: Write tests for critical logic, especially for database operations and complex UI interactions.
- **Browser Testing**: Use the browser subagent to verify UI changes and user flows.

### 4. Native Modules & Rebuilding
This project uses `better-sqlite3`, which is a native Node.js module.
- If you encounter issues with database initialization or "NODE_MODULE_VERSION" mismatches, run:
  ```bash
  npm run rebuild
  ```
- This script uses `electron-rebuild` to ensure the native module is compiled for the correct Electron version.

## Core Directories
- `src/main/ipc`: IPC handlers for backend communication.
- `src/main/repositories`: Data access layer for SQLite.
- `src/main/services`: Business logic layer.
- `src/renderer/screens`: Main application views.
- `src/renderer/components`: Reusable UI components.

---
*This file is a living document and should be updated as the project evolves.*
