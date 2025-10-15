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
    Quests.prototype.markKappaQuests = function () {
        var kappaPath = path.join(__dirname, "..", "db", "kappaQuests.json");
        var kappaQuestIds = JSON.parse(fs.readFileSync(kappaPath, "utf-8"));
        this.logger.info("[KappaMarker] Found ".concat(kappaQuestIds.length, " Kappa quests to mark."));
        for (var _i = 0, kappaQuestIds_1 = kappaQuestIds; _i < kappaQuestIds_1.length; _i++) {
            var questId = kappaQuestIds_1[_i];
            var quest = this.questDB()[questId];
            if (!quest) {
                this.logger.warning("[KappaMarker] Quest not found in DB: ".concat(questId));
                continue;
            }
            var descKey = questId + " description";
            var currentDesc = this.localesEN()[descKey];
            if (!currentDesc.includes("Required for Kappa")) {
                this.localesEN()[descKey] = "Required for Kappa.\n\n".concat(currentDesc);
            }
            if (!fs.existsSync(kappaPath)) {
                this.logger.warning("[KappaMarker] kappaQuests.json not found.");
                return;
            }
        }
        this.logger.info("[KappaMarker] Quest descriptions updated.");
    };
    return Quests;
}());
exports.Quests = Quests;
