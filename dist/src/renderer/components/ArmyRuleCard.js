"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const antd_1 = require("antd");
const react_markdown_1 = __importDefault(require("react-markdown"));
const { Title, Text } = antd_1.Typography;
// Map rule categories to colors
const CATEGORY_COLORS = {
    'Army Rule': 'blue',
    'Detachment': 'geekblue',
    'Enhancement': 'purple',
    'Stratagem': 'magenta',
    'Crusade Rule': 'cyan',
    'Boarding Action': 'volcano',
    'Sub-Rule': 'gold',
    'Campaign Rule': 'green',
    'Mission Rule': 'orange',
};
const ArmyRuleCard = ({ rule, onEdit, onDelete, isNested = false }) => {
    const color = CATEGORY_COLORS[rule.rule_category] || 'default';
    let parsedMetadata = null;
    if (rule.metadata) {
        try {
            parsedMetadata = JSON.parse(rule.metadata);
        }
        catch (e) {
            // ignore
        }
    }
    // Use action bar if callbacks provided, else nothing
    const actions = [];
    if (onEdit)
        actions.push((0, jsx_runtime_1.jsx)(antd_1.Button, { type: "link", onClick: () => onEdit(rule.id), children: "Edit" }, void 0));
    if (onDelete)
        actions.push((0, jsx_runtime_1.jsx)(antd_1.Button, { type: "link", danger: true, onClick: () => onDelete(rule.id), children: "Delete" }, void 0));
    return ((0, jsx_runtime_1.jsxs)(antd_1.Card, { className: "army-rule-card", style: {
            marginBottom: 16,
            borderLeft: `4px solid var(--ant-${color}-5, #1890ff)`,
            boxShadow: isNested ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
            backgroundColor: isNested ? '#fafafa' : '#fff'
        }, styles: { body: { padding: isNested ? '12px 16px' : '16px 20px' } }, actions: actions.length > 0 ? actions : undefined, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }, children: [(0, jsx_runtime_1.jsxs)(antd_1.Space, { direction: "vertical", size: 0, children: [(0, jsx_runtime_1.jsx)(Title, { level: isNested ? 5 : 4, style: { margin: 0 }, children: rule.name }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Tag, { color: color, style: { marginTop: 4 }, children: rule.rule_category }, void 0)] }, void 0), parsedMetadata && parsedMetadata.cost && ((0, jsx_runtime_1.jsxs)(antd_1.Tag, { color: "red", style: { fontSize: 14, padding: '2px 8px', fontWeight: 'bold' }, children: ["Cost: ", parsedMetadata.cost] }, void 0))] }, void 0), (0, jsx_runtime_1.jsx)("div", { className: "markdown-body", style: { marginTop: 12, lineHeight: 1.6 }, children: (0, jsx_runtime_1.jsx)(react_markdown_1.default, { children: rule.description }, void 0) }, void 0), parsedMetadata && Object.keys(parsedMetadata).filter(k => k !== 'cost').length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 16, padding: 8, background: isNested ? '#f0f0f0' : '#fafafa', borderRadius: 4 }, children: [(0, jsx_runtime_1.jsx)(Text, { type: "secondary", strong: true, children: "Metadata:" }, void 0), (0, jsx_runtime_1.jsx)("ul", { style: { paddingLeft: 20, margin: '4px 0 0' }, children: Object.entries(parsedMetadata).filter(([k]) => k !== 'cost').map(([k, v]) => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsxs)(Text, { type: "secondary", children: [k, ": ", String(v)] }, void 0) }, k))) }, void 0)] }, void 0)), rule.children && rule.children.length > 0 && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 24, paddingLeft: 16, borderLeft: '2px dashed #d9d9d9' }, children: rule.children.map(child => ((0, jsx_runtime_1.jsx)(ArmyRuleCard, { rule: child, onEdit: onEdit, onDelete: onDelete, isNested: true }, child.id))) }, void 0))] }, void 0));
};
exports.default = ArmyRuleCard;
//# sourceMappingURL=ArmyRuleCard.js.map