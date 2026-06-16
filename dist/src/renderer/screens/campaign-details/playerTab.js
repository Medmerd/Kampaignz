"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const api_1 = require("../../api");
const playerModal_1 = __importDefault(require("./playerModal"));
const AssignRuleModal_1 = __importDefault(require("./AssignRuleModal"));
const ArmyRuleCard_1 = __importDefault(require("../../components/ArmyRuleCard"));
const PlayerTab = ({ campaignId, notify }) => {
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [selectedPlayerId, setSelectedPlayerId] = (0, react_1.useState)(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = (0, react_1.useState)(false);
    const [assignPlayerId, setAssignPlayerId] = (0, react_1.useState)(null);
    const [assignArmyRuleId, setAssignArmyRuleId] = (0, react_1.useState)(null);
    const loadData = (0, react_1.useCallback)(async () => {
        try {
            const data = await api_1.api.listPlayersByCampaign(campaignId);
            // Fetch rules for all players
            const playersWithRules = await Promise.all(data.map(async (p) => {
                const rules = await api_1.api.listPlayerRules(p.id);
                return { ...p, playerRules: rules };
            }));
            setPlayers(playersWithRules);
        }
        catch (error) {
            console.error(error);
            if (notify) {
                notify('error', 'Failed to load players', error.message || String(error));
            }
        }
    }, [campaignId, notify]);
    (0, react_1.useEffect)(() => {
        loadData();
    }, [loadData]);
    const onCreatePlayer = (0, react_1.useCallback)(() => {
        setSelectedPlayerId(null);
        setIsModalOpen(true);
    }, []);
    const onEditPlayer = (0, react_1.useCallback)((playerId) => {
        setSelectedPlayerId(playerId);
        setIsModalOpen(true);
    }, []);
    const onClose = (0, react_1.useCallback)(() => {
        setIsModalOpen(false);
        loadData();
    }, [loadData]);
    const onAssignRule = (0, react_1.useCallback)((playerId, armyRuleId) => {
        setAssignPlayerId(playerId);
        setAssignArmyRuleId(armyRuleId);
        setIsAssignModalOpen(true);
    }, []);
    const onAssignClose = (0, react_1.useCallback)(() => {
        setIsAssignModalOpen(false);
        loadData();
    }, [loadData]);
    const onUnassignRule = (0, react_1.useCallback)(async (playerRuleId) => {
        try {
            await api_1.api.unassignRuleFromPlayer(playerRuleId);
            if (notify)
                notify('success', 'Rule Unassigned', 'The rule was removed from the player.');
            loadData();
        }
        catch (error) {
            console.error(error);
            if (notify)
                notify('error', 'Unassign Failed', error.message);
        }
    }, [notify, loadData]);
    const columns = [
        {
            title: 'Player Name',
            dataIndex: 'playerName',
            key: 'playerName',
            render: (text) => (0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 'bold' }, children: text }, void 0),
        },
        {
            title: 'Army Rulebook',
            dataIndex: 'army_rule_name',
            key: 'army_rule_name',
            render: (text) => ((0, jsx_runtime_1.jsx)("span", { style: { color: 'rgba(0, 0, 0, 0.45)' }, children: text || 'No Army Selected' }, void 0)),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => ((0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => onEditPlayer(record.id), children: "Edit" }, void 0)),
        },
    ];
    const expandedRowRender = (record) => {
        return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '0 24px 16px 24px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { margin: 0 }, children: "Assigned Rules" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "dashed", onClick: () => onAssignRule(record.id, record.army_rule_id), children: "Assign Rule" }, void 0)] }, void 0), record.playerRules && record.playerRules.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { children: record.playerRules.map((pr) => (pr.rule ? ((0, jsx_runtime_1.jsx)(ArmyRuleCard_1.default, { rule: pr.rule, isNested: true, onDelete: () => onUnassignRule(pr.id) }, pr.id)) : null)) }, void 0)) : ((0, jsx_runtime_1.jsx)("p", { style: { color: 'rgba(0,0,0,0.45)' }, children: "No rules assigned." }, void 0))] }, void 0));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "split", children: [(0, jsx_runtime_1.jsxs)("div", { style: { width: '100%' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Players" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { id: "new-player-button", className: "secondary-button", type: "primary", onClick: onCreatePlayer, children: "New player" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Table, { columns: columns, dataSource: players, rowKey: "id", expandable: { expandedRowRender }, pagination: false }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(playerModal_1.default, { playerId: selectedPlayerId, campaignId: campaignId, isOpen: isModalOpen, onClose: onClose, notify: notify }, void 0), (0, jsx_runtime_1.jsx)(AssignRuleModal_1.default, { playerId: assignPlayerId, campaignId: campaignId, armyRuleId: assignArmyRuleId, isOpen: isAssignModalOpen, onClose: onAssignClose, notify: notify }, void 0)] }, void 0));
};
exports.default = PlayerTab;
//# sourceMappingURL=playerTab.js.map