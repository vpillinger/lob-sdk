"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionLevel = void 0;
var VisionLevel;
(function (VisionLevel) {
    VisionLevel[VisionLevel["NotVisible"] = 0] = "NotVisible";
    VisionLevel[VisionLevel["VisibleFullyUnknown"] = 1] = "VisibleFullyUnknown";
    VisionLevel[VisionLevel["VisiblePartiallyUnknown"] = 2] = "VisiblePartiallyUnknown";
    VisionLevel[VisionLevel["VisibleWithoutBars"] = 3] = "VisibleWithoutBars";
    VisionLevel[VisionLevel["FullyVisible"] = 4] = "FullyVisible";
})(VisionLevel || (exports.VisionLevel = VisionLevel = {}));
