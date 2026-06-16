"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const api_1 = require("../../api");
const ArmyRuleCard_1 = __importDefault(require("../../components/ArmyRuleCard"));
const RuleModal_1 = __importDefault(require("./RuleModal"));
const CampaignRulesTab = ({ campaignId, notify }) => {
    const [rules, setRules] = (0, react_1.useState)([]);
    const [isRuleModalOpen, setIsRuleModalOpen] = (0, react_1.useState)(false);
    const [selectedRuleId, setSelectedRuleId] = (0, react_1.useState)(null);
    const loadData = async () => {
        try {
            const data = await api_1.api.listRulesByCampaign(campaignId);
            setRules(data);
        }
        catch (error) {
            console.error(error);
            if (notify)
                notify('error', 'Failed to load Campaign Rules', error.message || String(error));
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [campaignId]);
    const onCreateRule = (0, react_1.useCallback)(() => {
        setSelectedRuleId(null);
        setIsRuleModalOpen(true);
    }, []);
    const onEditRule = (0, react_1.useCallback)((id) => {
        setSelectedRuleId(id);
        setIsRuleModalOpen(true);
    }, []);
    const onDeleteRule = (0, react_1.useCallback)((id) => {
        api_1.api.deleteRule(id).then(() => {
            if (notify)
                notify('success', 'Rule deleted');
            loadData();
        }).catch(err => {
            if (notify)
                notify('error', 'Failed to delete', err.message);
        });
    }, [notify]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "split", children: [(0, jsx_runtime_1.jsxs)("div", { style: { width: '100%' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Campaign Rules" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { id: "new-campaign-rule-button", type: "primary", onClick: onCreateRule, children: "New Campaign Rule" }, void 0)] }, void 0), rules.length === 0 ? ((0, jsx_runtime_1.jsx)(antd_1.Empty, { description: "No global rules added to this campaign yet." }, void 0)) : (rules.map(rule => ((0, jsx_runtime_1.jsx)(ArmyRuleCard_1.default, { rule: rule, onEdit: onEditRule, onDelete: onDeleteRule }, rule.id))))] }, void 0), (0, jsx_runtime_1.jsx)(RuleModal_1.default, { ruleId: selectedRuleId, parentType: "campaign", parentId: campaignId, isOpen: isRuleModalOpen, onClose: () => {
                    setIsRuleModalOpen(false);
                    loadData();
                }, notify: notify, existingRulesTree: rules }, void 0)] }, void 0));
};
exports.default = CampaignRulesTab;
//# sourceMappingURL=CampaignRulesTab.js.map