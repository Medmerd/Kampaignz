"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const api_1 = require("../../api");
const ArmyRuleModal = ({ armyRuleId, campaignId, isOpen, onClose, notify }) => {
    const [form] = antd_1.Form.useForm();
    const [loading, setLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            if (armyRuleId) {
                setLoading(true);
                api_1.api.getArmyRulebook(armyRuleId).then((rulebook) => {
                    form.setFieldsValue({
                        name: rulebook.name,
                        description: rulebook.description,
                    });
                }).catch(err => {
                    if (notify)
                        notify('error', 'Failed to load Army Rulebook', err.message);
                }).finally(() => {
                    setLoading(false);
                });
            }
            else {
                form.resetFields();
            }
        }
    }, [isOpen, armyRuleId, form, notify]);
    const handleSave = async (values) => {
        try {
            if (armyRuleId) {
                await api_1.api.updateArmyRulebook(armyRuleId, values);
                if (notify)
                    notify('success', 'Army Rulebook updated');
            }
            else {
                await api_1.api.createArmyRulebook(campaignId, values);
                if (notify)
                    notify('success', 'Army Rulebook created');
            }
            onClose();
        }
        catch (error) {
            if (notify)
                notify('error', 'Failed to save Army Rulebook', error.message);
        }
    };
    return ((0, jsx_runtime_1.jsx)(antd_1.Modal, { title: armyRuleId ? "Edit Army Rulebook" : "New Army Rulebook", open: isOpen, onCancel: onClose, footer: null, children: (0, jsx_runtime_1.jsxs)(antd_1.Form, { form: form, layout: "vertical", onFinish: handleSave, style: { marginTop: 20 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "name", label: "Name", rules: [{ required: true, message: 'Please input the rulebook name!' }], children: (0, jsx_runtime_1.jsx)(antd_1.Input, { disabled: loading }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "description", label: "Description", children: (0, jsx_runtime_1.jsx)(antd_1.Input.TextArea, { rows: 4, disabled: loading }, void 0) }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Form.Item, { style: { textAlign: 'right', marginBottom: 0 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: onClose, style: { marginRight: 8 }, children: "Cancel" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", loading: loading, children: "Save" }, void 0)] }, void 0)] }, void 0) }, void 0));
};
exports.default = ArmyRuleModal;
//# sourceMappingURL=armyRuleModal.js.map