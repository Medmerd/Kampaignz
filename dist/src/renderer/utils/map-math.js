"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistanceInInches = exports.mmToPixels = exports.MM_PER_INCH = exports.inchesToPixels = exports.PIXELS_PER_INCH = void 0;
// Global constant for scaling
exports.PIXELS_PER_INCH = 20;
/**
 * Converts inches to canvas pixels based on the global scale.
 */
function inchesToPixels(inches) {
    return inches * exports.PIXELS_PER_INCH;
}
exports.inchesToPixels = inchesToPixels;
exports.MM_PER_INCH = 25.4;
/**
 * Converts millimeters to canvas pixels based on the global scale.
 */
function mmToPixels(mm) {
    const inches = mm / exports.MM_PER_INCH;
    return inchesToPixels(inches);
}
exports.mmToPixels = mmToPixels;
/**
 * Calculates straight line distance in inches between two pixel coordinates.
 */
function calculateDistanceInInches(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distancePixels = Math.sqrt(dx * dx + dy * dy);
    return distancePixels / exports.PIXELS_PER_INCH;
}
exports.calculateDistanceInInches = calculateDistanceInInches;
//# sourceMappingURL=map-math.js.map