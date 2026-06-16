"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const antd_1 = require("antd");
const api_1 = require("../../api");
const SessionModal = (options) => {
    const { campaignId, sessionId, isOpen, onClose, notify, session } = options;
    const [missions, setMissions] = (0, react_1.useState)([]);
    const { register, control, reset, handleSubmit } = (0, react_hook_form_1.useForm)({
        defaultValues: {
            campaign_id: campaignId,
            id: sessionId,
            title: '',
            notes: '',
            config: '{}',
            mission_ids: [],
            created_at: '',
        }
    });
    const loadData = async () => {
        if (!isOpen)
            return;
        try {
            const loadedMissions = await api_1.api.listMissionsByCampaign(campaignId);
            setMissions(loadedMissions);
        }
        catch (err) {
            console.error('Failed to load missions:', err);
        }
        if (session) {
            reset(session);
        }
        else {
            reset({
                campaign_id: campaignId,
                id: -1,
                title: '',
                notes: '',
                config: '{}',
                mission_ids: [],
                created_at: '',
            });
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [isOpen, session, campaignId]);
    const onSubmit = (0, react_1.useCallback)(async (data) => {
        const { id, mission_ids, campaign_id, ...rest } = data;
        const input = { ...rest, missionIds: mission_ids, campaignId: campaign_id };
        try {
            if (id && id > 0) {
                await api_1.api.updateSession(id, input);
                if (notify)
                    notify('success', 'Session updated', 'The session was updated successfully.');
            }
            else {
                await api_1.api.createSession(campaign_id, input);
                if (notify)
                    notify('success', 'Session created', 'The session was created successfully.');
            }
            onClose();
        }
        catch (error) {
            console.error('Error saving session:', error);
            if (notify)
                notify('error', 'Error saving session', error.message || String(error));
        }
    }, [notify, onClose]);
    return ((0, jsx_runtime_1.jsx)(antd_1.Modal, { title: sessionId && sessionId > 0 ? 'Edit session' : 'Create session', closable: false, onCancel: onClose, open: isOpen, width: 720, footer: null, children: (0, jsx_runtime_1.jsxs)("form", { id: 'sessionForm', className: 'detailsForm', onSubmit: handleSubmit(onSubmit), style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "session-title", children: "Title" }, void 0), (0, jsx_runtime_1.jsx)("input", { id: "session-title", type: "text", required: true, ...register('title') }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "session-mission-ids", children: "Missions" }, void 0), (0, jsx_runtime_1.jsx)(react_hook_form_1.Controller, { name: "mission_ids", control: control, render: ({ field }) => ((0, jsx_runtime_1.jsx)(antd_1.Select, { ...field, id: "session-mission-ids", mode: "multiple", style: { width: '100%' }, options: missions.map(mission => ({ value: mission.id, label: mission.title })) }, void 0)) }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "session-notes", children: "Notes" }, void 0), (0, jsx_runtime_1.jsx)("textarea", { id: "session-notes", rows: 4, ...register('notes') }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "session-config", children: "Config (JSON object)" }, void 0), (0, jsx_runtime_1.jsx)("textarea", { id: "session-config", rows: 4, ...register('config') }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Space, { style: { padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", children: sessionId && sessionId > 0 ? 'Save session' : 'Create session' }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "default", onClick: onClose, children: "Cancel" }, void 0)] }, void 0)] }, void 0) }, void 0));
};
exports.default = SessionModal;
//# sourceMappingURL=sessionModal.js.map