"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var quests_1 = require("./quests");
var fs = require("fs");
var path = require("path");
var KappaMarkerMod = /** @class */ (function () {
    function KappaMarkerMod() {
    }
    KappaMarkerMod.prototype.postDBLoad = function (container) {
        var logger = container.resolve("WinstonLogger");
        var databaseServer = container.resolve("DatabaseServer");
        var tables = databaseServer.getTables();
        var quests = new quests_1.Quests(logger, tables);
        // Wczytaj konfigurację moda
        var configPath = path.join(__dirname, "..", "config", "modConfig.json");
        var config;
        try {
            config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        }
        catch (err) {
            logger.error("[KappaMarker] Failed to read modConfig.json: ".concat(err));
            return;
        }
        var kappaPath = path.join(__dirname, "..", "db", "kappaQuests.json");
        // Generates Kappa quest list if it doesn't exist
        if (!fs.existsSync(kappaPath)) {
            logger.info("[KappaMarker] kappaQuests.json not found, generating...");
            quests.generateKappaQuestList();
        }
        var kappaQuestIds = [];
        try {
            var raw = fs.readFileSync(kappaPath, "utf-8");
            kappaQuestIds = JSON.parse(raw);
        }
        catch (err) {
            logger.error("[KappaMarker] Failed to read or parse kappaQuests.json: ".concat(err));
            return;
        }
        if (config.markNames) {
            quests.markKappaNames(kappaQuestIds);
        }
        if (config.markDescriptions) {
            quests.markKappaDescriptions(kappaQuestIds);
        }
        logger.info("[KappaMarker] Mod actions completed successfully.");
    };
    return KappaMarkerMod;
}());
module.exports = { mod: new KappaMarkerMod() };
