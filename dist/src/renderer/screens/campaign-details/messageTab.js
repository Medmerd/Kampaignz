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
const messageModal_1 = __importDefault(require("./messageModal"));
const MessagesTab = ({ campaignId, notify }) => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [selectedMessageId, setSelectedMessageId] = (0, react_1.useState)(-1);
    const [selectedMessage, setSelectedMessage] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [isModalOpen, setModalOpen] = (0, react_1.useState)(false);
    const loadData = async () => {
        try {
            const refreshMessages = await api_1.api.listMessagesByCampaign(campaignId);
            setMessages(refreshMessages);
            setLoading(false);
        }
        catch (err) {
            console.error('Failed to load messages', err);
            if (notify)
                notify('error', 'Failed to load messages', err.message);
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [campaignId]);
    (0, react_1.useEffect)(() => {
        if (!selectedMessageId || selectedMessageId <= 0) {
            return;
        }
        const selected = messages.find((message) => message.id === selectedMessageId);
        setSelectedMessage(selected || null);
    }, [selectedMessageId, messages]);
    const onCreateMessage = (0, react_1.useCallback)(() => {
        setSelectedMessageId(-1);
        setSelectedMessage(null);
        setModalOpen(true);
    }, []);
    const onEditMessage = (0, react_1.useCallback)((messageId) => {
        setSelectedMessageId(messageId);
        const selected = messages.find((message) => message.id === messageId);
        setSelectedMessage(selected || null);
        setModalOpen(true);
    }, [messages]);
    const onModalClosed = (0, react_1.useCallback)(() => {
        setModalOpen(false);
        setSelectedMessage(null);
        setSelectedMessageId(-1);
        loadData();
    }, []);
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { children: "Loading..." }, void 0));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "split", children: [(0, jsx_runtime_1.jsxs)("div", { style: { width: '100%' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Messages" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { id: "new-message-button", className: "secondary-button", type: "primary", onClick: onCreateMessage, children: "New message" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)("ul", { className: "campaign-list", style: { listStyle: 'none', padding: 0 }, children: messages.map((message) => ((0, jsx_runtime_1.jsxs)("li", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold' }, children: message.content ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '') : '(empty)' }, void 0), (0, jsx_runtime_1.jsx)("div", { style: { color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }, children: (0, format_1.formatDate)(message.created_at) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => onEditMessage(message.id), children: "Edit" }, void 0)] }, message.id))) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(messageModal_1.default, { message: selectedMessage, messageId: selectedMessageId, campaignId: campaignId, isOpen: isModalOpen, onClose: onModalClosed, notify: notify }, void 0)] }, void 0));
};
exports.default = MessagesTab;
//# sourceMappingURL=messageTab.js.map