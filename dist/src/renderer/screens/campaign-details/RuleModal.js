"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const api_1 = require("../../api");
const CATEGORIES = [
    'Army Rule', 'Detachment', 'Enhancement', 'Stratagem',
    'Crusade Rule', 'Boarding Action', 'Sub-Rule', 'Campaign Rule', 'Mission Rule'
];
// Helper to flatten the tree for the dropdown
const flattenRules = (rules, excludeId = null) => {
    let result = [];
    for (const r of rules) {
        if (r.id === excludeId)
            continue; // Don't let a rule be its own parent
        result.push({ value: r.id, label: r.name });
        if (r.children && r.children.length > 0) {
            result = result.concat(flattenRules(r.children, excludeId));
        }
    }
    return result;
};
const RuleModal = ({ ruleId, parentType, parentId, isOpen, onClose, notify, existingRulesTree }) => {
    const [form] = antd_1.Form.useForm();
    const [loading, setLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            if (ruleId) {
                setLoading(true);
                api_1.api.getRule(ruleId).then((rule) => {
                    let maxPerPlayer = null;
                    let maxCampaignWide = null;
                    let remainingMetadata = '';
                    if (rule.metadata) {
                        try {
                            // If Knex auto-parses the JSON column, rule.metadata might already be an object
                            const parsed = typeof rule.metadata === 'string'
                                ? JSON.parse(rule.metadata)
                                : { ...rule.metadata };
                            if (parsed.max_per_player !== undefined) {
                                maxPerPlayer = parsed.max_per_player;
                                delete parsed.max_per_player;
                            }
                            if (parsed.max_campaign_wide !== undefined) {
                                maxCampaignWide = parsed.max_campaign_wide;
                                delete parsed.max_campaign_wide;
                            }
                            if (Object.keys(parsed).length > 0) {
                                remainingMetadata = JSON.stringify(parsed, null, 2);
                            }
                        }
                        catch (e) {
                            remainingMetadata = typeof rule.metadata === 'string'
                                ? rule.metadata
                                : JSON.stringify(rule.metadata, null, 2);
                        }
                    }
                    form.setFieldsValue({
                        name: rule.name,
                        rule_category: rule.rule_category,
                        description: rule.description,
                        max_per_player: maxPerPlayer,
                        max_campaign_wide: maxCampaignWide,
                        metadata: remainingMetadata,
                        parent_rule_id: rule.parent_rule_id,
                    });
                }).catch(err => {
                    if (notify)
                        notify('error', 'Failed to load Rule', err.message);
                }).finally(() => setLoading(false));
            }
            else {
                form.resetFields();
            }
        }
    }, [isOpen, ruleId, form, notify]);
    const handleSave = async (values) => {
        try {
            setLoading(true);
            let metadataObj = {};
            if (values.metadata) {
                try {
                    metadataObj = JSON.parse(values.metadata);
                }
                catch (e) {
                    throw new Error('Metadata must be valid JSON');
                }
            }
            if (values.max_per_player !== null && values.max_per_player !== undefined && values.max_per_player !== '') {
                metadataObj.max_per_player = values.max_per_player;
            }
            if (values.max_campaign_wide !== null && values.max_campaign_wide !== undefined && values.max_campaign_wide !== '') {
                metadataObj.max_campaign_wide = values.max_campaign_wide;
            }
            const finalMetadata = Object.keys(metadataObj).length > 0 ? JSON.stringify(metadataObj) : null;
            const payload = {
                name: values.name,
                rule_category: values.rule_category,
                description: values.description,
                metadata: finalMetadata,
                parent_rule_id: values.parent_rule_id || null,
            };
            if (ruleId) {
                await api_1.api.updateRule(ruleId, payload);
                if (notify)
                    notify('success', 'Rule updated');
            }
            else {
                const createPayload = {
                    ...payload,
                    army_rule_id: parentType === 'army_rule' ? parentId : null,
                    campaign_id: parentType === 'campaign' ? parentId : null,
                    mission_id: parentType === 'mission' ? parentId : null,
                };
                await api_1.api.createRule(createPayload);
                if (notify)
                    notify('success', 'Rule created');
            }
            onClose();
        }
        catch (error) {
            if (notify)
                notify('error', 'Failed to save Rule', error.message);
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)(antd_1.Modal, { title: ruleId ? "Edit Rule" : "New Rule", open: isOpen, onCancel: onClose, footer: null, width: 600, children: (0, jsx_runtime_1.jsxs)(antd_1.Form, { form: form, layout: "vertical", onFinish: handleSave, style: { marginTop: 20 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "name", label: "Rule Name", rules: [{ required: true, message: 'Required' }], children: (0, jsx_runtime_1.jsx)(antd_1.Input, { disabled: loading }, void 0) }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 16 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "rule_category", label: "Category", rules: [{ required: true, message: 'Required' }], style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)(antd_1.Select, { disabled: loading, options: CATEGORIES.map(c => ({ value: c, label: c })) }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "parent_rule_id", label: "Parent Rule", style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)(antd_1.Select, { disabled: loading, allowClear: true, placeholder: "None (Root Level)", options: flattenRules(existingRulesTree, ruleId) }, void 0) }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 16 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "max_per_player", label: "Max Per Player", style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)(antd_1.InputNumber, { disabled: loading, min: 1, style: { width: '100%' }, placeholder: "No limit" }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "max_campaign_wide", label: "Max Campaign Wide", style: { flex: 1 }, children: (0, jsx_runtime_1.jsx)(antd_1.InputNumber, { disabled: loading, min: 1, style: { width: '100%' }, placeholder: "No limit" }, void 0) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "description", label: "Description (Markdown Supported)", rules: [{ required: true, message: 'Required' }], children: (0, jsx_runtime_1.jsx)(antd_1.Input.TextArea, { rows: 6, disabled: loading, style: { fontFamily: 'monospace' } }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "metadata", label: "Metadata (Optional JSON)", children: (0, jsx_runtime_1.jsx)(antd_1.Input.TextArea, { rows: 2, disabled: loading, placeholder: '{"cost": "1CP", "phase": "Command"}' }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { style: { textAlign: 'right', marginBottom: 0 }, children: (0, jsx_runtime_1.jsxs)(antd_1.Space, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: onClose, children: "Cancel" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", loading: loading, children: "Save" }, void 0)] }, void 0) }, void 0)] }, void 0) }, void 0));
};
exports.default = RuleModal;
//# sourceMappingURL=RuleModal.js.map