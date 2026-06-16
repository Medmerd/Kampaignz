"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const index_1 = __importDefault(require("./screens/campaign-details/index"));
function App() {
    const [selectedCampaignId, setSelectedCampaignId] = (0, react_1.useState)(null);
    return ((0, jsx_runtime_1.jsx)(index_1.default, { selectedCampaignId: selectedCampaignId, onSelectCampaign: (id) => setSelectedCampaignId(id) }, void 0));
}
exports.default = App;
//# sourceMappingURL=App.js.map