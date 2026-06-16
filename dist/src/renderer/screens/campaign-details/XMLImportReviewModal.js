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
const XMLImportReviewModal = ({ isOpen, onClose, armyRulebookId, initialCaptures, notify }) => {
    const [captures, setCaptures] = (0, react_1.useState)([]);
    const [selectedRowKeys, setSelectedRowKeys] = (0, react_1.useState)([]);
    const [selectedCapture, setSelectedCapture] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [form] = antd_1.Form.useForm();
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            setCaptures(initialCaptures);
            setSelectedRowKeys(initialCaptures.filter(c => c.selected).map(c => c.id));
            setSelectedCapture(null);
        }
    }, [isOpen, initialCaptures]);
    (0, react_1.useEffect)(() => {
        if (selectedCapture) {
            form.setFieldsValue({
                name: selectedCapture.name,
                rule_category: selectedCapture.rule_category,
                description: selectedCapture.description,
                metadata: selectedCapture.metadata || ''
            });
        }
    }, [selectedCapture, form]);
    const handleUpdateCapture = (values) => {
        if (!selectedCapture)
            return;
        const updated = captures.map(c => c.id === selectedCapture.id ? { ...c, ...values } : c);
        setCaptures(updated);
        setSelectedCapture(null);
    };
    const handleImportSelected = async () => {
        const rulesToImport = captures.filter(c => selectedRowKeys.includes(c.id));
        if (rulesToImport.length === 0) {
            if (notify)
                notify('warning', 'No rules selected for import.');
            return;
        }
        try {
            setLoading(true);
            for (const capture of rulesToImport) {
                const payload = {
                    name: capture.name,
                    rule_category: capture.rule_category,
                    description: capture.description,
                    metadata: capture.metadata || null,
                    army_rule_id: armyRulebookId,
                    parent_rule_id: null,
                };
                await api_1.api.createRule(payload);
            }
            if (notify)
                notify('success', `Imported ${rulesToImport.length} rules successfully!`);
            onClose();
        }
        catch (error) {
            console.error(error);
            if (notify)
                notify('error', 'Import Failed', error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
        },
        {
            title: 'Category',
            dataIndex: 'rule_category',
            key: 'rule_category',
            width: '20%',
        },
        {
            title: 'Description Preview',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text ? text.substring(0, 80) + '...' : ''
        }
    ];
    return ((0, jsx_runtime_1.jsxs)(antd_1.Modal, { title: "Review Battlescribe XML Import", open: isOpen, onCancel: onClose, width: "90vw", footer: null, style: { top: 20 }, bodyStyle: { height: '80vh', display: 'flex', gap: 20, paddingBottom: 0 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { flex: 2, display: 'flex', flexDirection: 'column', height: '100%' }, children: (0, jsx_runtime_1.jsx)(antd_1.Table, { rowSelection: {
                        selectedRowKeys,
                        onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
                    }, columns: columns, dataSource: captures.map(c => ({ ...c, key: c.id })), pagination: false, scroll: { y: 'calc(80vh - 120px)' }, onRow: (record) => {
                        return {
                            onClick: () => {
                                setSelectedCapture(record);
                            },
                        };
                    }, rowClassName: (record) => selectedCapture?.id === record.id ? 'ant-table-row-selected' : '', style: { cursor: 'pointer' } }, void 0) }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #f0f0f0', paddingLeft: 20 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { flex: 1, overflowY: 'auto' }, children: selectedCapture ? ((0, jsx_runtime_1.jsxs)(antd_1.Form, { form: form, layout: "vertical", onFinish: handleUpdateCapture, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Edit Rule" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "name", label: "Rule Name", rules: [{ required: true }], children: (0, jsx_runtime_1.jsx)(antd_1.Input, {}, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "rule_category", label: "Category", rules: [{ required: true }], children: (0, jsx_runtime_1.jsx)(antd_1.Select, { options: CATEGORIES.map(c => ({ value: c, label: c })) }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "description", label: "Description", children: (0, jsx_runtime_1.jsx)(antd_1.Input.TextArea, { rows: 8 }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "metadata", label: "Metadata (JSON)", children: (0, jsx_runtime_1.jsx)(antd_1.Input.TextArea, { rows: 3 }, void 0) }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Space, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", children: "Save Adjustments" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => setSelectedCapture(null), children: "Cancel" }, void 0)] }, void 0)] }, void 0)) : ((0, jsx_runtime_1.jsx)("div", { style: { color: '#888', marginTop: 40, textAlign: 'center' }, children: "Select a rule from the table on the left to edit it." }, void 0)) }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { padding: '20px 0', borderTop: '1px solid #f0f0f0', textAlign: 'right' }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: { margin: '0 0 16px 0', textAlign: 'left' }, children: ["Rules to Import: ", selectedRowKeys.length, " / ", captures.length] }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Space, { children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: onClose, disabled: loading, children: "Cancel" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Popconfirm, { title: `Import ${selectedRowKeys.length} rules?`, onConfirm: handleImportSelected, children: (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", loading: loading, disabled: selectedRowKeys.length === 0, children: "Import Selected" }, void 0) }, void 0)] }, void 0)] }, void 0)] }, void 0)] }, void 0));
};
exports.default = XMLImportReviewModal;
//# sourceMappingURL=XMLImportReviewModal.js.map