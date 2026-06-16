"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const antd_1 = require("antd");
const api_1 = require("../../api");
const PlayerModal = (options) => {
    const { campaignId, playerId, isOpen, onClose, notify } = options;
    const [selectedPlayer, setSelectedPlayer] = (0, react_1.useState)(null);
    const [armyRules, setArmyRules] = (0, react_1.useState)([]);
    const { register, control, reset, handleSubmit } = (0, react_hook_form_1.useForm)({
        defaultValues: {
            playerName: '',
            army_rule_id: null,
            notes: '',
            config: '{}',
        }
    });
    const loadData = async () => {
        if (!isOpen)
            return;
        try {
            const rulebooks = await api_1.api.listArmyRulebooksByCampaign(campaignId);
            setArmyRules(rulebooks.map(rb => ({ value: rb.id, label: rb.name })));
            if (playerId) {
                // We fetch all players and find the specific one. 
                // Alternatively, we could add `getPlayer` to API, but this is fast enough.
                const players = await api_1.api.listPlayersByCampaign(campaignId);
                const player = players.find(p => p.id === playerId);
                if (player) {
                    setSelectedPlayer(player);
                    reset({
                        playerName: player.playerName,
                        army_rule_id: player.army_rule_id,
                        notes: player.notes || '',
                        config: player.config ? JSON.stringify(player.config, null, 2) : '{}',
                    });
                }
            }
            else {
                setSelectedPlayer(null);
                reset({
                    playerName: '',
                    army_rule_id: null,
                    notes: '',
                    config: '{}',
                });
            }
        }
        catch (error) {
            console.error('Error loading player data:', error);
            if (notify)
                notify('error', 'Failed to load player details', error.message);
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [isOpen, playerId, campaignId]);
    const onFormClose = (0, react_1.useCallback)(() => {
        onClose();
    }, [onClose]);
    const onSubmit = (0, react_1.useCallback)(async (data) => {
        try {
            // Format config if necessary
            // let parsedConfig = {};
            // try {
            //     parsedConfig = JSON.parse(data.config as unknown as string);
            // } catch (e) {
            //     console.warn('Config is not valid JSON, saving as empty object', e);
            // }
            const input = {
                ...data,
                config: data.config
            };
            if (!playerId) {
                await api_1.api.createPlayer(campaignId, input);
                if (notify)
                    notify('success', 'Player created', 'Player added successfully');
            }
            else {
                await api_1.api.updatePlayer(playerId, input);
                if (notify)
                    notify('success', 'Player updated', 'Player updated successfully');
            }
            onFormClose();
        }
        catch (error) {
            console.error('Error saving player:', error);
            if (notify)
                notify('error', 'Error saving player', error.message);
        }
    }, [playerId, campaignId, notify, onFormClose]);
    return ((0, jsx_runtime_1.jsx)(antd_1.Modal, { title: selectedPlayer ? 'Edit player' : 'Create player', closable: false, onCancel: onFormClose, open: isOpen, width: 520, footer: null, children: (0, jsx_runtime_1.jsxs)("form", { id: 'playerForm', className: 'detailsForm', onSubmit: handleSubmit(onSubmit), style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "player-name", children: "Player name" }, void 0), (0, jsx_runtime_1.jsx)("input", { id: "player-name", type: "text", required: true, ...register('playerName') }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "player-army", children: "Army" }, void 0), (0, jsx_runtime_1.jsx)(react_hook_form_1.Controller, { name: "army_rule_id", control: control, rules: { required: true }, render: ({ field }) => ((0, jsx_runtime_1.jsx)(antd_1.Select, { ...field, id: "player-army", options: armyRules, style: { width: '100%' }, placeholder: "Select an Army" }, void 0)) }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "player-notes", children: "Notes" }, void 0), (0, jsx_runtime_1.jsx)("textarea", { id: "player-notes", rows: 4, ...register('notes') }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "player-config", children: "Config (JSON object)" }, void 0), (0, jsx_runtime_1.jsx)("textarea", { id: "player-config", rows: 4, ...register('config') }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Space, { style: { padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", children: selectedPlayer ? 'Save player' : 'Create player' }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "default", onClick: onFormClose, children: "Cancel" }, void 0)] }, void 0)] }, void 0) }, void 0));
};
exports.default = PlayerModal;
//# sourceMappingURL=playerModal.js.map