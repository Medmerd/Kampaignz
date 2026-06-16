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
const missionModal_1 = __importDefault(require("./missionModal"));
const MissionsTab = ({ campaignId, notify }) => {
    const [missions, setMissions] = (0, react_1.useState)([]);
    const [isDrawerOpen, setIsDrawerOpen] = (0, react_1.useState)(false);
    const [selectedMissionId, setSelectedMissionId] = (0, react_1.useState)(null);
    const loadData = async () => {
        try {
            const data = await api_1.api.listMissionsByCampaign(campaignId);
            setMissions(data);
        }
        catch (error) {
            console.error(error);
            if (notify) {
                notify('error', 'Failed to load missions', error.message || String(error));
            }
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [campaignId]);
    const onCreateMission = (0, react_1.useCallback)(() => {
        setSelectedMissionId(null);
        setIsDrawerOpen(true);
    }, []);
    const onEditMission = (0, react_1.useCallback)((missionId) => {
        setSelectedMissionId(missionId);
        setIsDrawerOpen(true);
    }, []);
    const onClose = (0, react_1.useCallback)(() => {
        setIsDrawerOpen(false);
        loadData();
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "split", children: [(0, jsx_runtime_1.jsxs)("div", { style: { width: '100%' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Missions" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { id: "new-mission-button", className: "secondary-button", type: "primary", onClick: onCreateMission, children: "New mission" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)("ul", { className: "campaign-list", style: { listStyle: 'none', padding: 0 }, children: missions.map((mission) => ((0, jsx_runtime_1.jsxs)("li", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold' }, children: mission.title }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px' }, children: ["Created ", (0, format_1.formatDate)(mission.created_at)] }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => onEditMission(mission.id), children: "Edit" }, void 0)] }, mission.id))) }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(missionModal_1.default, { missionId: selectedMissionId || 0, campaignId: campaignId, isOpen: isDrawerOpen, onClose: onClose, notify: notify }, void 0)] }, void 0));
};
exports.default = MissionsTab;
//# sourceMappingURL=missionsTab.js.map