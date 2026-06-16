"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const antd_1 = require("antd");
const api_1 = require("../../api");
const MessageModal = (options) => {
    const { campaignId, messageId, isOpen, onClose, notify, message } = options;
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const { control, register, reset, handleSubmit } = (0, react_hook_form_1.useForm)({
        defaultValues: {
            campaign_id: campaignId,
            id: messageId,
            content: '',
            config: '{}',
            player_ids: [],
        }
    });
    const loadData = async () => {
        if (!isOpen)
            return;
        try {
            const playerList = await api_1.api.listPlayersByCampaign(campaignId);
            const formatted = playerList.map(player => ({ label: player.playerName, value: player.id }));
            setPlayers(formatted);
            if (message) {
                const { config, ...rest } = message;
                let configStr = '{}';
                try {
                    configStr = config || '{}';
                }
                catch (e) {
                    configStr = '{}';
                }
                reset({ ...rest, config: configStr });
            }
            else {
                reset({
                    campaign_id: campaignId,
                    id: -1,
                    content: '',
                    config: '{}',
                    player_ids: [],
                });
            }
        }
        catch (error) {
            console.error('Failed to load message modal data', error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [isOpen, campaignId, messageId, message]);
    const onSubmit = (0, react_1.useCallback)(async (data) => {
        const { content, config, player_ids: playerIds } = data;
        const input = { content, config, playerIds };
        try {
            if (!messageId || messageId <= 0) {
                await api_1.api.createMessage(campaignId, input);
                if (notify)
                    notify('success', 'Message created', 'The message was created successfully.');
            }
            else {
                await api_1.api.updateMessage(messageId, input);
                if (notify)
                    notify('success', 'Message updated', 'The message was updated successfully.');
            }
            onClose();
        }
        catch (error) {
            console.error('Error saving message:', error);
            if (notify)
                notify('error', 'Error saving message', error.message || String(error));
        }
    }, [campaignId, messageId, notify, onClose]);
    if (loading && isOpen) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(antd_1.Modal, { title: messageId && messageId > 0 ? 'Edit message' : 'Create message', closable: false, onCancel: onClose, open: isOpen, width: 720, footer: null, children: (0, jsx_runtime_1.jsxs)("form", { id: 'messageForm', className: 'detailsForm', onSubmit: handleSubmit(onSubmit), style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "message-content", children: "Message Content" }, void 0), (0, jsx_runtime_1.jsx)("textarea", { id: "message-content", rows: 8, ...register('content') }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "message-player-ids", children: "Associated Players" }, void 0), (0, jsx_runtime_1.jsx)(react_hook_form_1.Controller, { name: 'player_ids', control: control, render: ({ field }) => ((0, jsx_runtime_1.jsx)(antd_1.Select, { ...field, id: "message-player-ids", style: { width: '100%' }, options: players, mode: "multiple" }, void 0)) }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "message-config", children: "Config (JSON object)" }, void 0), (0, jsx_runtime_1.jsx)("textarea", { id: "message-config", rows: 4, ...register('config') }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Space, { style: { padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", children: messageId && messageId > 0 ? 'Save message' : 'Create message' }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "default", onClick: onClose, children: "Cancel" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", ghost: true, children: "Generate Message" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", ghost: true, children: "Send to Discord" }, void 0)] }, void 0)] }, void 0) }, void 0));
};
exports.default = MessageModal;
//# sourceMappingURL=messageModal.js.map