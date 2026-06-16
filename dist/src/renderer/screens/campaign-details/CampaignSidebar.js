"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const api_1 = require("../../api");
const format_1 = require("../../utils/format");
const { Title, Text } = antd_1.Typography;
const test = import.meta.env.VITE_DB_CLIENT || 'none';
function CampaignSidebar({ onSelectCampaign, selectedCampaignId }) {
    const [campaigns, setCampaigns] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [form] = antd_1.Form.useForm();
    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const data = await api_1.api.listCampaigns();
            setCampaigns(data);
        }
        catch (error) {
            antd_1.message.error('Failed to load campaigns');
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchCampaigns();
    }, []);
    const onFinish = async (values) => {
        try {
            await api_1.api.createCampaign(values.name);
            form.resetFields();
            antd_1.message.success('Campaign created');
            fetchCampaigns();
        }
        catch (error) {
            antd_1.message.error(error instanceof Error ? error.message : 'Failed to create campaign');
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }, children: [(0, jsx_runtime_1.jsx)(Title, { level: 3, style: { marginTop: 0 }, children: "Kampaignz" }, void 0), (0, jsx_runtime_1.jsxs)(Text, { type: "secondary", style: { marginBottom: '20px', display: 'block' }, children: ["Env: ", test] }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Form, { form: form, onFinish: onFinish, layout: "vertical", style: { marginBottom: 24 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Form.Item, { name: "name", rules: [{ required: true, message: 'Please input campaign name!' }], style: { marginBottom: '8px' }, children: (0, jsx_runtime_1.jsx)(antd_1.Input, { placeholder: "New campaign name" }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Form.Item, { style: { marginBottom: 0 }, children: (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", block: true, children: "Create" }, void 0) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.List, { loading: loading, itemLayout: "horizontal", dataSource: campaigns, style: { flex: 1, overflowY: 'auto' }, renderItem: (campaign) => {
                    const isSelected = selectedCampaignId === campaign.id;
                    return ((0, jsx_runtime_1.jsx)(antd_1.List.Item, { style: {
                            cursor: 'pointer',
                            padding: '12px 16px',
                            marginBottom: '8px',
                            borderRadius: '8px',
                            background: isSelected ? '#e6f4ff' : 'transparent',
                            border: isSelected ? '1px solid #1677ff' : '1px solid transparent',
                            transition: 'all 0.3s'
                        }, onClick: () => onSelectCampaign(campaign.id), children: (0, jsx_runtime_1.jsx)(antd_1.List.Item.Meta, { title: (0, jsx_runtime_1.jsx)(Text, { strong: isSelected, style: { color: isSelected ? '#1677ff' : 'inherit' }, children: campaign.name }, void 0), description: (0, format_1.formatDate)(campaign.created_at) }, void 0) }, void 0));
                } }, void 0)] }, void 0));
}
exports.default = CampaignSidebar;
//# sourceMappingURL=CampaignSidebar.js.map