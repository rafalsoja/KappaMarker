"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
Object.defineProperty(exports, "__esModule", { value: true });
const quests_1 = require("./quests");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class KappaMarkerMod {
    postDBLoad(container) {
        const logger = container.resolve("WinstonLogger");
        const databaseServer = container.resolve("DatabaseServer");
        const tables = databaseServer.getTables();
        const quests = new quests_1.Quests(logger, tables);
        // Wczytaj konfigurację moda
        const configPath = path.join(__dirname, "..", "config", "modConfig.json");
        let config;
        try {
            config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        }
        catch (err) {
            logger.error(`[KappaMarker] Failed to read modConfig.json: ${err}`);
            return;
        }
        const kappaPath = path.join(__dirname, "..", "db", "kappaQuests.json");
        // Generates Kappa quest list if it doesn't exist
        if (!fs.existsSync(kappaPath)) {
            logger.info("[KappaMarker] kappaQuests.json not found, generating...");
            quests.generateKappaQuestList();
        }
        let kappaQuestIds = [];
        try {
            const raw = fs.readFileSync(kappaPath, "utf-8");
            kappaQuestIds = JSON.parse(raw);
        }
        catch (err) {
            logger.error(`[KappaMarker] Failed to read or parse kappaQuests.json: ${err}`);
            return;
        }
        if (config.markNames) {
            quests.markKappaNames(kappaQuestIds);
        }
        if (config.markDescriptions) {
            quests.markKappaDescriptions(kappaQuestIds);
        }
        logger.info(`[KappaMarker] Mod actions completed successfully.`);
    }
}
module.exports = { mod: new KappaMarkerMod() };
//# sourceMappingURL=mod.js.map