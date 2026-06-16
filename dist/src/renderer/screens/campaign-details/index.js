"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const antd_1 = require("antd");
const api_1 = require("../../api");
const dom_1 = require("../../utils/dom");
const format_1 = require("../../utils/format");
const playerTab_1 = __importDefault(require("./playerTab"));
const messageTab_1 = __importDefault(require("./messageTab"));
const missionsTab_1 = __importDefault(require("./missionsTab"));
const sessionsTab_1 = __importDefault(require("./sessionsTab"));
const armyRulesTab_1 = __importDefault(require("./armyRulesTab"));
const CampaignRulesTab_1 = __importDefault(require("./CampaignRulesTab"));
const CampaignSidebar_1 = __importDefault(require("./CampaignSidebar"));
const { Sider, Content } = antd_1.Layout;
const { Title, Text } = antd_1.Typography;
const TABS = ['campaign', 'players', 'messages', 'missions', 'sessions', 'army_rules', 'campaign_rules'];
function Dashboard({ selectedCampaignId, onSelectCampaign }) {
    const [activeTab, setActiveTab] = (0, react_1.useState)('campaign');
    const [campaign, setCampaign] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [notificationApi, contextHolder] = antd_1.notification.useNotification();
    // Form state
    const [name, setName] = (0, react_1.useState)('');
    const [expectedSessions, setExpectedSessions] = (0, react_1.useState)(1);
    const [config, setConfig] = (0, react_1.useState)('{}');
    const loadData = async () => {
        if (!selectedCampaignId) {
            setCampaign(null);
            return;
        }
        setLoading(true);
        try {
            const fetchedCampaign = await api_1.api.getCampaign(selectedCampaignId);
            setCampaign(fetchedCampaign);
            setName(fetchedCampaign.name);
            setExpectedSessions(fetchedCampaign.expectedSessions);
            setConfig(typeof fetchedCampaign.config === 'string'
                ? fetchedCampaign.config
                : JSON.stringify(fetchedCampaign.config ?? {}, null, 2));
        }
        catch (error) {
            console.error('Failed to load campaign:', error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [selectedCampaignId]);
    const tabItems = (0, react_1.useMemo)(() => {
        const tabs = TABS.map((tab) => {
            const label = tab === 'army_rules' ? 'Army Rules' : tab === 'campaign_rules' ? 'Campaign Rules' : tab.charAt(0).toUpperCase() + tab.slice(1);
            return { key: tab, label };
        });
        return tabs;
    }, []);
    /* Callbacks */
    const notify = (0, react_1.useCallback)((type, title, description) => {
        notificationApi[type]({
            message: title,
            description,
            placement: 'bottomRight',
        });
    }, [notificationApi]);
    const onTabChange = (0, react_1.useCallback)((activeKey) => {
        setActiveTab(activeKey);
    }, []);
    const handleSaveCampaignDetails = async (e) => {
        e.preventDefault();
        if (!selectedCampaignId)
            return;
        try {
            let parsedConfig = {};
            try {
                parsedConfig = JSON.parse(config);
            }
            catch (err) {
                notify('error', 'Invalid JSON', 'Configuration must be a valid JSON object.');
                return;
            }
            const updated = await api_1.api.updateCampaignDetails(selectedCampaignId, {
                name: name.trim(),
                expectedSessions,
                config: JSON.stringify(parsedConfig),
            });
            setCampaign(updated);
            notify('success', 'Campaign Updated', 'The campaign details were updated successfully.');
        }
        catch (error) {
            console.error('Failed to update campaign:', error);
            notify('error', 'Failed to update campaign', error.message || String(error));
        }
    };
    return ((0, jsx_runtime_1.jsxs)(antd_1.Layout, { style: { minHeight: '100vh' }, children: [contextHolder, (0, jsx_runtime_1.jsx)(Sider, { width: 300, style: { background: '#fff', borderRight: '1px solid #f0f0f0' }, children: (0, jsx_runtime_1.jsx)(CampaignSidebar_1.default, { onSelectCampaign: onSelectCampaign, selectedCampaignId: selectedCampaignId }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(Content, { style: { padding: '24px', overflowY: 'auto' }, children: !selectedCampaignId ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)(antd_1.Empty, { description: (0, jsx_runtime_1.jsx)(Text, { type: "secondary", style: { fontSize: '18px' }, children: "Select a Campaign from the sidebar or create a new one." }, void 0), image: antd_1.Empty.PRESENTED_IMAGE_SIMPLE }, void 0) }, void 0)) : loading || !campaign ? ((0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)(Text, { children: "Loading campaign..." }, void 0) }, void 0)) : ((0, jsx_runtime_1.jsxs)(antd_1.Card, { style: { maxWidth: 1024, margin: '0 auto' }, children: [(0, jsx_runtime_1.jsx)(Title, { level: 2, style: { marginTop: 0 }, children: (0, dom_1.escapeHtml)(campaign.name) }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "horizontal", size: "large", style: { marginBottom: 24 }, children: [(0, jsx_runtime_1.jsxs)(Text, { type: "secondary", children: [(0, jsx_runtime_1.jsx)("strong", { children: "ID:" }, void 0), " ", campaign.id] }, void 0), (0, jsx_runtime_1.jsxs)(Text, { type: "secondary", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Created:" }, void 0), " ", (0, format_1.formatDate)(campaign.created_at)] }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Tabs, { activeKey: activeTab, items: tabItems, onChange: onTabChange }, void 0), (0, jsx_runtime_1.jsx)("section", { className: `tab-panel ${activeTab === 'campaign' ? '' : 'is-hidden'}`, "data-panel": "campaign", style: { display: activeTab === 'campaign' ? 'block' : 'none' }, children: (0, jsx_runtime_1.jsxs)("form", { id: "campaign-details-form", className: "details-form", onSubmit: handleSaveCampaignDetails, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "edit-campaign-name", style: { display: 'block', marginBottom: 8 }, children: "Name" }, void 0), (0, jsx_runtime_1.jsx)("input", { id: "edit-campaign-name", type: "text", value: name, onChange: (e) => setName(e.target.value), required: true, style: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "edit-campaign-expected-sessions", style: { display: 'block', marginBottom: 8 }, children: "Expected sessions" }, void 0), (0, jsx_runtime_1.jsx)("input", { id: "edit-campaign-expected-sessions", type: "number", min: "1", step: "1", value: expectedSessions, onChange: (e) => setExpectedSessions(Number(e.target.value)), required: true, style: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "edit-campaign-config", style: { display: 'block', marginBottom: 8 }, children: "Config (JSON object)" }, void 0), (0, jsx_runtime_1.jsx)("textarea", { id: "edit-campaign-config", rows: 5, value: config, onChange: (e) => setConfig(e.target.value), style: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6 } }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", children: "Save changes" }, void 0)] }, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { style: { display: activeTab === 'players' ? 'block' : 'none' }, children: (0, jsx_runtime_1.jsx)(playerTab_1.default, { campaignId: selectedCampaignId, notify: notify }, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { style: { display: activeTab === 'messages' ? 'block' : 'none' }, children: (0, jsx_runtime_1.jsx)(messageTab_1.default, { campaignId: selectedCampaignId, notify: notify }, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { style: { display: activeTab === 'missions' ? 'block' : 'none' }, children: (0, jsx_runtime_1.jsx)(missionsTab_1.default, { campaignId: selectedCampaignId, notify: notify }, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { style: { display: activeTab === 'sessions' ? 'block' : 'none' }, children: (0, jsx_runtime_1.jsx)(sessionsTab_1.default, { campaignId: selectedCampaignId, notify: notify }, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { style: { display: activeTab === 'army_rules' ? 'block' : 'none' }, children: (0, jsx_runtime_1.jsx)(armyRulesTab_1.default, { campaignId: selectedCampaignId, notify: notify }, void 0) }, void 0), (0, jsx_runtime_1.jsx)("div", { style: { display: activeTab === 'campaign_rules' ? 'block' : 'none' }, children: (0, jsx_runtime_1.jsx)(CampaignRulesTab_1.default, { campaignId: selectedCampaignId, notify: notify }, void 0) }, void 0)] }, void 0)) }, void 0)] }, void 0));
}
exports.default = Dashboard;
//# sourceMappingURL=index.js.map