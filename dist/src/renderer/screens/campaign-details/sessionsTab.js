"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const api_1 = require("../../api");
const format_1 = require("../../utils/format");
const sessionModal_1 = __importDefault(require("./sessionModal"));
const SessionsTab = ({ campaignId, notify }) => {
    const [selectedSession, setSelectedSession] = (0, react_1.useState)(undefined);
    const [selectedSessionId, setSelectedSessionId] = (0, react_1.useState)(-1);
    const [sessions, setSessions] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isDrawerOpen, setIsDrawerOpen] = (0, react_1.useState)(false);
    const loadData = async () => {
        try {
            const fetchedSessions = await api_1.api.listSessionsByCampaign(campaignId);
            setSessions(fetchedSessions);
        }
        catch (error) {
            console.error('Failed to load sessions:', error);
            if (notify)
                notify('error', 'Failed to load sessions', error.message);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [campaignId]);
    const onCreateSession = (0, react_1.useCallback)(() => {
        setSelectedSessionId(-1);
        setSelectedSession(undefined);
        setIsDrawerOpen(true);
    }, []);
    const onEditSession = (0, react_1.useCallback)((sessionId) => {
        const session = sessions.find(s => s.id === sessionId);
        setSelectedSessionId(sessionId);
        setSelectedSession(session);
        setIsDrawerOpen(true);
    }, [sessions]);
    const onClose = () => {
        setIsDrawerOpen(false);
        loadData();
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { children: "Loading..." }, void 0));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "split", children: [(0, jsx_runtime_1.jsxs)("div", { style: { width: '100%' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Campaign Sessions" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { id: "new-session-button", className: "secondary-button", type: "primary", onClick: onCreateSession, children: "New session" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)("ul", { className: "campaign-list", style: { listStyle: 'none', padding: 0 }, children: sessions.map((session) => ((0, jsx_runtime_1.jsxs)("li", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold' }, children: session.title }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }, children: [session.mission_ids.length > 0 ? `${session.mission_ids.length} mission(s)` : 'Not initialized', " \u2022 Created ", (0, format_1.formatDate)(session.created_at)] }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => onEditSession(session.id), children: "Edit" }, void 0)] }, session.id))) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(sessionModal_1.default, { session: selectedSession, sessionId: selectedSessionId, campaignId: campaignId, isOpen: isDrawerOpen, onClose: onClose, notify: notify }, void 0)] }, void 0));
};
exports.default = SessionsTab;
//# sourceMappingURL=sessionsTab.js.map