"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryRequired = exports.mount = exports.escapeHtml = void 0;
const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
exports.escapeHtml = escapeHtml;
const mount = (root, html) => {
    root.innerHTML = html;
};
exports.mount = mount;
const queryRequired = (selector, parent = document) => {
    const element = parent.querySelector(selector);
    if (!element) {
        throw new Error(`Missing required element: ${selector}`);
    }
    return element;
};
exports.queryRequired = queryRequired;
//# sourceMappingURL=dom.js.map