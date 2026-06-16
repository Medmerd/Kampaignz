"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
const api_1 = require("../../api");
const ArmyRuleCard_1 = __importDefault(require("../../components/ArmyRuleCard"));
const RuleModal_1 = __importDefault(require("./RuleModal"));
const xml_parser_1 = require("../../utils/xml-parser");
const XMLImportReviewModal_1 = __importDefault(require("./XMLImportReviewModal"));
const { Text } = antd_1.Typography;
const ArmyRulebookDetailsDrawer = ({ rulebook, isOpen, onClose, notify }) => {
    const [rules, setRules] = (0, react_1.useState)([]);
    const [isRuleModalOpen, setIsRuleModalOpen] = (0, react_1.useState)(false);
    const [selectedRuleId, setSelectedRuleId] = (0, react_1.useState)(null);
    const fileInputRef = react_1.default.useRef(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = (0, react_1.useState)(false);
    const [xmlCaptures, setXmlCaptures] = (0, react_1.useState)([]);
    const handleXMLDump = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !rulebook)
            return;
        try {
            if (notify)
                notify('info', 'Parsing XML...', 'Reading Battlescribe data...');
            const extractedCaptures = await (0, xml_parser_1.parseBattlescribeXML)(file);
            setXmlCaptures(extractedCaptures);
            setIsReviewModalOpen(true);
        }
        catch (e) {
            console.error(e);
            if (notify)
                notify('error', 'Extraction Failed', e.message);
        }
        if (fileInputRef.current)
            fileInputRef.current.value = '';
    };
    const loadRules = async () => {
        if (!rulebook)
            return;
        try {
            const data = await api_1.api.listRulesByArmyRulebook(rulebook.id);
            setRules(data);
        }
        catch (error) {
            if (notify)
                notify('error', 'Failed to load rules', error.message);
        }
    };
    (0, react_1.useEffect)(() => {
        if (isOpen && rulebook) {
            loadRules();
        }
    }, [isOpen, rulebook]);
    const handleCreate = () => {
        setSelectedRuleId(null);
        setIsRuleModalOpen(true);
    };
    const handleEdit = (id) => {
        setSelectedRuleId(id);
        setIsRuleModalOpen(true);
    };
    const handleDelete = (id) => {
        api_1.api.deleteRule(id).then(() => {
            if (notify)
                notify('success', 'Rule deleted');
            loadRules();
        }).catch(err => {
            if (notify)
                notify('error', 'Failed to delete', err.message);
        });
    };
    return ((0, jsx_runtime_1.jsxs)(antd_1.Drawer, { title: rulebook ? `Army Rulebook: ${rulebook.name}` : '', placement: "right", width: 600, onClose: onClose, open: isOpen, extra: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: ".cat,.xml", style: { display: 'none' }, ref: fileInputRef, onChange: handleXMLDump }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: () => fileInputRef.current?.click(), children: "Import Battlescribe (.cat)" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", icon: (0, jsx_runtime_1.jsx)(icons_1.PlusOutlined, {}, void 0), onClick: handleCreate, children: "Add Rule" }, void 0)] }, void 0), children: [rulebook && ((0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 24 }, children: (0, jsx_runtime_1.jsx)(Text, { type: "secondary", children: rulebook.description }, void 0) }, void 0)), rules.length === 0 ? ((0, jsx_runtime_1.jsx)(antd_1.Empty, { description: "No rules added to this rulebook yet." }, void 0)) : (rules.map(rule => ((0, jsx_runtime_1.jsx)(ArmyRuleCard_1.default, { rule: rule, onEdit: handleEdit, onDelete: handleDelete }, rule.id)))), rulebook && ((0, jsx_runtime_1.jsx)(RuleModal_1.default, { ruleId: selectedRuleId, parentType: "army_rule", parentId: rulebook.id, isOpen: isRuleModalOpen, onClose: () => {
                    setIsRuleModalOpen(false);
                    loadRules();
                }, notify: notify, existingRulesTree: rules }, void 0)), rulebook && ((0, jsx_runtime_1.jsx)(XMLImportReviewModal_1.default, { isOpen: isReviewModalOpen, onClose: () => {
                    setIsReviewModalOpen(false);
                    loadRules();
                }, armyRulebookId: rulebook.id, initialCaptures: xmlCaptures, notify: notify }, void 0))] }, void 0));
};
exports.default = ArmyRulebookDetailsDrawer;
//# sourceMappingURL=ArmyRulebookDetailsDrawer.js.map