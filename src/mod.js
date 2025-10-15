"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var quests_1 = require("./quests");
var KappaMarkerMod = /** @class */ (function () {
    function KappaMarkerMod() {
    }
    KappaMarkerMod.prototype.postDBLoad = function (container) {
        var logger = container.resolve("WinstonLogger");
        var databaseServer = container.resolve("DatabaseServer");
        var tables = databaseServer.getTables();
        var quests = new quests_1.Quests(logger, tables);
        quests.markKappaQuests();
    };
    return KappaMarkerMod;
}());
module.exports = { mod: new KappaMarkerMod() };
