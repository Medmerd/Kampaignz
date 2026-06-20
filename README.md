# Kampaignz Tabletop Campaign Manager

Kampaignz is a prototype Tabletop Campaign Builder and Manager designed to assist Game Masters (GMs) and Dungeon Masters (DMs) in planning, tracking, and chronicling campaigns with style.

---

## 🏗️ Symmetrical Hybrid Architecture

Kampaignz is built using a unique **Symmetrical Hybrid Architecture** designed to execute seamlessly in two entirely different contexts without changing a single line of React UI code:

1. **Native Desktop Mode (Electron)**: A local, offline-first application saving to a local SQLite file database.
2. **Standalone Web Mode (Pod/Web Server)**: A containerized or self-hosted web application serving multiple users using either local SQLite or a shared PostgreSQL database cluster via an RPC dispatcher.
3. **Independent REST API**: A standalone Express REST API located in `apps/api/` exposing core domain logic over standard HTTP endpoints (useful for third-party integrations or decoupled frontends).

### Communication Flow Diagram

The Frontend API layer dynamically wraps both IPC (for desktop Electron) and RPC-over-HTTP (for web browser clients) seamlessly:

```mermaid
graph TD
    subgraph Frontend [React Application]
        UI[React Components] --> API[api.ts Adapter]
    end

    subgraph Desktop [Electron Mode]
        API -->|window.api exists| IPC[Preload Context Bridge]
        IPC -->|ipcRenderer.invoke| MainIPC[ipcMain Handlers]
        MainIPC --> Repo[Repositories & Database]
    end

    subgraph Web [Pod / Web Mode]
        API -->|window.api undefined| HTTP[fetch POST /api/rpc]
        HTTP -->|Network Request| WebServer[Express Web Server]
        WebServer -->|RPC Dispatcher| Repo
    end
    
    subgraph IndependentAPI [REST API Mode]
        ExternalClient[External Clients] -->|HTTP REST| RestAPI[Express REST API]
        RestAPI -->|Standard Routing| Repo
    end
    
    subgraph DataPersistence [Database Adapters]
        Repo -->|VITE_DB_CLIENT=development| SQLite[Local SQLite file]
        Repo -->|VITE_DB_CLIENT=devpostgresql| Postgres[PostgreSQL Instance]
    end
```

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have Node.js and npm installed. Sourcing your NVM profile may be required:
```bash
source ~/.nvm/nvm.sh
```

---

## 🚀 Running the Application

### 1. Desktop Mode (Electron - deprecated)
Launch Kampaignz as a local Electron desktop application:
```bash
npm run start:fe
```
*Note:* SQLite migrations are run automatically on application startup.

### 2. Standalone Web Mode (Pod/Web Server)
Run Symmetrical Kampaignz Node.js web-server and API in development mode with watch/hot-reloading enabled:
```bash
npm run dev
```

### 3. Independent REST API
Run the standalone REST API (which exposes standard endpoints bypassing the RPC dispatcher):
```bash
npm run start:independent-api
```
*(See `apps/api/README.md` for more detailed instructions).*

---

## 📖 API Documentation

The Independent REST API is fully documented and provides collections for direct integration:
- **OpenAPI Schema**: Located at `apps/api/openapi.yaml`
- **Postman Collection**: Located at `apps/api/postman_collection.json` (Import into Postman or Insomnia to explore the endpoints)

---

## 🧪 Testing

Kampaignz uses **Vitest** for running fast repository, database mapping, IPC integration, and extensive REST API integration tests.
```bash
npm run test
```

With coverage report:
```bash
npm run test:coverage
```

## Lint

```bash
npm run lint
```