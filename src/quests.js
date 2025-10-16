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
exports.Quests = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Quests {
    logger;
    tables;
    constructor(logger, tables) {
        this.logger = logger;
        this.tables = tables;
    }
    localesEN() {
        return this.tables.locales.global["en"];
    }
    questDB() {
        return this.tables.templates.quests;
    }
    generateKappaQuestList() {
        const questDB = this.questDB();
        const locales = this.localesEN();
        const collectorEntry = Object.entries(locales).find(([key, value]) => key.endsWith(" name") && value.toLowerCase().includes("collector"));
        if (!collectorEntry) {
            this.logger.error("[KappaMarker] Could not find 'The Collector' quest.");
            return;
        }
        const collectorId = collectorEntry[0].replace(" name", "");
        this.logger.info(`[KappaMarker] Found 'The Collector' quest ID: ${collectorId}`);
        const visited = new Set();
        const collectDependencies = (questId) => {
            if (visited.has(questId))
                return;
            visited.add(questId);
            const quest = questDB[questId];
            if (!quest?.conditions?.AvailableForStart)
                return;
            for (const condition of quest.conditions.AvailableForStart) {
                if (condition.conditionType === "Quest" && condition.target) {
                    collectDependencies(condition.target);
                }
            }
        };
        collectDependencies(collectorId);
        const outputPath = path.join(__dirname, "..", "db", "kappaQuests.json");
        fs.writeFileSync(outputPath, JSON.stringify(Array.from(visited), null, 4), "utf-8");
        this.logger.info(`[KappaMarker] Saved ${visited.size} Kappa quest IDs to ${outputPath}`);
    }
    markKappaDescriptions(kappaQuestIds) {
        const locales = this.tables.locales.global;
        let totalUpdated = 0;
        const updatedPerLang = {};
        for (const questId of kappaQuestIds) {
            const descKey = questId + " description";
            for (const lang in locales) {
                const currentDesc = locales[lang]?.[descKey];
                if (!currentDesc)
                    continue;
                if (!currentDesc.includes("Required for Kappa")) {
                    locales[lang][descKey] = `Required for Kappa.\n\n${currentDesc}`;
                    totalUpdated++;
                    updatedPerLang[lang] = (updatedPerLang[lang] || 0) + 1;
                }
            }
        }
        this.logger.info(`[KappaMarker] Updated ${totalUpdated} descriptions across ${Object.keys(updatedPerLang).length} languages.`);
    }
    markKappaNames(kappaQuestIds) {
        const locales = this.tables.locales.global;
        let totalUpdated = 0;
        const updatedPerLang = {};
        for (const questId of kappaQuestIds) {
            const nameKey = questId + " name";
            for (const lang in locales) {
                const currentName = locales[lang]?.[nameKey];
                if (!currentName)
                    continue;
                if (!currentName.startsWith("[K]")) {
                    locales[lang][nameKey] = `[K] ${currentName}`;
                    totalUpdated++;
                    updatedPerLang[lang] = (updatedPerLang[lang] || 0) + 1;
                }
            }
        }
        this.logger.info(`[KappaMarker] Updated ${totalUpdated} quest names across ${Object.keys(updatedPerLang).length} languages.`);
    }
}
exports.Quests = Quests;
//# sourceMappingURL=quests.js.map