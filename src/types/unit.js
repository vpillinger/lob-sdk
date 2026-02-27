"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitStatus = void 0;
var UnitStatus;
(function (UnitStatus) {
    /** Standing units can receive orders and fight normally */
    UnitStatus[UnitStatus["Standing"] = 1] = "Standing";
    /** Routing units cannot receive orders and they will flee if possible */
    UnitStatus[UnitStatus["Routing"] = 2] = "Routing";
    /** Recovering units cannot receive orders but they will keep fighting */
    UnitStatus[UnitStatus["Recovering"] = 3] = "Recovering";
})(UnitStatus || (exports.UnitStatus = UnitStatus = {}));
