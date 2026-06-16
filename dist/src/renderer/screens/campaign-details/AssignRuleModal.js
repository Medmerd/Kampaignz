"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const antd_1 = require("antd");
const api_1 = require("../../api");
const AssignRuleModal = ({ playerId, campaignId, armyRuleId, isOpen, onClose, notify }) => {
    const [eligibleRules, setEligibleRules] = (0, react_1.useState)([]);
    const { control, handleSubmit, reset } = (0, react_hook_form_1.useForm)({
        defaultValues: { rule_id: null }
    });
    const loadData = (0, react_1.useCallback)(async () => {
        if (!isOpen)
            return;
        try {
            // Fetch campaign rules
            const campaignRules = await api_1.api.listRulesByCampaign(campaignId);
            const allRules = [...campaignRules];
            setEligibleRules(allRules.map(r => ({
                value: r.id,
                label: r.name,
                category: r.rule_category
            })));
            reset({ rule_id: null });
        }
        catch (error) {
            console.error('Error loading eligible rules:', error);
            if (notify)
                notify('error', 'Failed to load rules', error.message);
        }
    }, [isOpen, campaignId, armyRuleId, notify, reset]);
    (0, react_1.useEffect)(() => {
        loadData();
    }, [loadData]);
    const onSubmit = async (data) => {
        if (!playerId || !data.rule_id)
            return;
        try {
            await api_1.api.assignRuleToPlayer(playerId, data.rule_id);
            if (notify)
                notify('success', 'Rule Assigned', 'The rule was successfully assigned to the player.');
            onClose();
        }
        catch (error) {
            console.error('Error assigning rule:', error);
            if (notify)
                notify('error', 'Assignment Failed', error.message);
        }
    };
    // Group options by category for the Select dropdown
    const groupedOptions = eligibleRules.reduce((acc, rule) => {
        const group = acc.find(g => g.label === rule.category);
        if (group) {
            group.options.push({ value: rule.value, label: rule.label });
        }
        else {
            acc.push({
                label: rule.category,
                options: [{ value: rule.value, label: rule.label }]
            });
        }
        return acc;
    }, []);
    return ((0, jsx_runtime_1.jsx)(antd_1.Modal, { title: "Assign Rule to Player", closable: false, onCancel: onClose, open: isOpen, footer: null, children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit(onSubmit), style: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }, children: [(0, jsx_runtime_1.jsx)(react_hook_form_1.Controller, { name: "rule_id", control: control, rules: { required: true }, render: ({ field }) => ((0, jsx_runtime_1.jsx)(antd_1.Select, { ...field, options: groupedOptions, style: { width: '100%' }, placeholder: "Select a rule to assign", showSearch: true, optionFilterProp: "label" }, void 0)) }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Space, { style: { padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", children: "Assign Rule" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "default", onClick: onClose, children: "Cancel" }, void 0)] }, void 0)] }, void 0) }, void 0));
};
exports.default = AssignRuleModal;
//# sourceMappingURL=AssignRuleModal.js.map