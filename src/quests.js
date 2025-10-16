"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quests = void 0;
var fs = require("fs");
var path = require("path");
var Quests = /** @class */ (function () {
    function Quests(logger, tables) {
        this.logger = logger;
        this.tables = tables;
    }
    Quests.prototype.localesEN = function () {
        return this.tables.locales.global["en"];
    };
    Quests.prototype.questDB = function () {
        return this.tables.templates.quests;
    };
    Quests.prototype.generateKappaQuestList = function () {
        var questDB = this.questDB();
        var locales = this.localesEN();
        var collectorEntry = Object.entries(locales).find(function (_a) {
            var key = _a[0], value = _a[1];
            return key.endsWith(" name") && value.toLowerCase().includes("collector");
        });
        if (!collectorEntry) {
            this.logger.error("[KappaMarker] Could not find 'The Collector' quest.");
            return;
        }
        var collectorId = collectorEntry[0].replace(" name", "");
        this.logger.info("[KappaMarker] Found 'The Collector' quest ID: ".concat(collectorId));
        var visited = new Set();
        var collectDependencies = function (questId) {
            var _a;
            if (visited.has(questId))
                return;
            visited.add(questId);
            var quest = questDB[questId];
            if (!((_a = quest === null || quest === void 0 ? void 0 : quest.conditions) === null || _a === void 0 ? void 0 : _a.AvailableForStart))
                return;
            for (var _i = 0, _b = quest.conditions.AvailableForStart; _i < _b.length; _i++) {
                var condition = _b[_i];
                if (condition.conditionType === "Quest" && condition.target) {
                    collectDependencies(condition.target);
                }
            }
        };
        collectDependencies(collectorId);
        var outputPath = path.join(__dirname, "..", "db", "kappaQuests.json");
        fs.writeFileSync(outputPath, JSON.stringify(Array.from(visited), null, 4), "utf-8");
        this.logger.info("[KappaMarker] Saved ".concat(visited.size, " Kappa quest IDs to ").concat(outputPath));
    };
    Quests.prototype.markKappaDescriptions = function (kappaQuestIds) {
        var _a;
        var locales = this.tables.locales.global;
        var totalUpdated = 0;
        var updatedPerLang = {};
        for (var _i = 0, kappaQuestIds_1 = kappaQuestIds; _i < kappaQuestIds_1.length; _i++) {
            var questId = kappaQuestIds_1[_i];
            var descKey = questId + " description";
            for (var lang in locales) {
                var currentDesc = (_a = locales[lang]) === null || _a === void 0 ? void 0 : _a[descKey];
                if (!currentDesc)
                    continue;
                if (!currentDesc.includes("Required for Kappa")) {
                    locales[lang][descKey] = "Required for Kappa.\n\n".concat(currentDesc);
                    totalUpdated++;
                    updatedPerLang[lang] = (updatedPerLang[lang] || 0) + 1;
                }
            }
        }
        this.logger.info("[KappaMarker] Updated ".concat(totalUpdated, " descriptions across ").concat(Object.keys(updatedPerLang).length, " languages."));
        for (var lang in updatedPerLang) {
            this.logger.info("[KappaMarker] \u2192 ".concat(lang, ": ").concat(updatedPerLang[lang], " quests updated"));
        }
    };
    Quests.prototype.markKappaNames = function (kappaQuestIds) {
        var _a;
        var locales = this.tables.locales.global;
        var totalUpdated = 0;
        var updatedPerLang = {};
        for (var _i = 0, kappaQuestIds_2 = kappaQuestIds; _i < kappaQuestIds_2.length; _i++) {
            var questId = kappaQuestIds_2[_i];
            var nameKey = questId + " name";
            for (var lang in locales) {
                var currentName = (_a = locales[lang]) === null || _a === void 0 ? void 0 : _a[nameKey];
                if (!currentName)
                    continue;
                if (!currentName.startsWith("[K]")) {
                    locales[lang][nameKey] = "[K] ".concat(currentName);
                    totalUpdated++;
                    updatedPerLang[lang] = (updatedPerLang[lang] || 0) + 1;
                }
            }
        }
        this.logger.info("[KappaMarker] Updated ".concat(totalUpdated, " quest names across ").concat(Object.keys(updatedPerLang).length, " languages."));
        for (var lang in updatedPerLang) {
            this.logger.info("[KappaMarker] \u2192 ".concat(lang, ": ").concat(updatedPerLang[lang], " names updated"));
        }
    };
    return Quests;
}());
exports.Quests = Quests;
