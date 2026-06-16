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
const armyRuleModal_1 = __importDefault(require("./armyRuleModal"));
const ArmyRulebookDetailsDrawer_1 = __importDefault(require("./ArmyRulebookDetailsDrawer"));
const ArmyRulesTab = ({ campaignId, notify }) => {
    const [rulebooks, setRulebooks] = (0, react_1.useState)([]);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [selectedRulebookId, setSelectedRulebookId] = (0, react_1.useState)(null);
    const [isDrawerOpen, setIsDrawerOpen] = (0, react_1.useState)(false);
    const [selectedRulebookForDrawer, setSelectedRulebookForDrawer] = (0, react_1.useState)(null);
    const loadData = async () => {
        try {
            const data = await api_1.api.listArmyRulebooksByCampaign(campaignId);
            setRulebooks(data);
        }
        catch (error) {
            console.error(error);
            if (notify)
                notify('error', 'Failed to load Army Rulebooks', error.message || String(error));
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [campaignId]);
    const onCreateRulebook = (0, react_1.useCallback)(() => {
        setSelectedRulebookId(null);
        setIsModalOpen(true);
    }, []);
    const onEditRulebook = (0, react_1.useCallback)((id) => {
        setSelectedRulebookId(id);
        setIsModalOpen(true);
    }, []);
    const onClose = (0, react_1.useCallback)(() => {
        setIsModalOpen(false);
        loadData();
    }, []);
    const onOpenDrawer = (0, react_1.useCallback)((rulebook) => {
        setSelectedRulebookForDrawer(rulebook);
        setIsDrawerOpen(true);
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "split", children: [(0, jsx_runtime_1.jsxs)("div", { style: { width: '100%' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Army Rulebooks" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { id: "new-army-rulebook-button", type: "primary", onClick: onCreateRulebook, children: "New Army Rulebook" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)("ul", { className: "campaign-list", style: { listStyle: 'none', padding: 0 }, children: rulebooks.map((rulebook) => {
                            const isShared = rulebook.original_campaign_id !== campaignId;
                            return ((0, jsx_runtime_1.jsxs)("li", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontWeight: 'bold' }, children: [rulebook.name, " ", isShared && (0, jsx_runtime_1.jsx)(antd_1.Tag, { color: "blue", style: { marginLeft: 8 }, children: "Shared" }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }, children: ["Created ", (0, format_1.formatDate)(rulebook.created_at)] }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => onOpenDrawer(rulebook), children: "Manage Rules" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => onEditRulebook(rulebook.id), children: "Edit" }, void 0)] }, void 0)] }, rulebook.id));
                        }) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(armyRuleModal_1.default, { armyRuleId: selectedRulebookId, campaignId: campaignId, isOpen: isModalOpen, onClose: onClose, notify: notify }, void 0), (0, jsx_runtime_1.jsx)(ArmyRulebookDetailsDrawer_1.default, { rulebook: selectedRulebookForDrawer, isOpen: isDrawerOpen, onClose: () => setIsDrawerOpen(false), notify: notify }, void 0)] }, void 0));
};
exports.default = ArmyRulesTab;
//# sourceMappingURL=armyRulesTab.js.map