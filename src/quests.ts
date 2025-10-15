import * as fs from "fs";
import * as path from "path";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { IQuest } from "@spt-aki/models/eft/quests/IQuest";

export class Quests {
    constructor(private logger: ILogger, private tables: IDatabaseTables) {}

    private localesEN(): Record<string, string> {
        return this.tables.locales.global["en"];
    }

    private questDB(): Record<string, IQuest> {
        return this.tables.templates.quests;
    }

    public markKappaQuests(): void {
        const kappaPath = path.join(__dirname, "..", "db", "kappaQuests.json");
        const kappaQuestIds: string[] = JSON.parse(fs.readFileSync(kappaPath, "utf-8"));
        this.logger.info(`[KappaMarker] Found ${kappaQuestIds.length} Kappa quests to mark.`);

        for (const questId of kappaQuestIds) {
            const quest = this.questDB()[questId];
            if (!quest) {
                this.logger.warning(`[KappaMarker] Quest not found in DB: ${questId}`);
                continue;
            }

            const descKey = questId + " description";
            const currentDesc = this.localesEN()[descKey];

            if (!currentDesc.includes("Required for Kappa")) {
                this.localesEN()[descKey] = `Required for Kappa.\n\n${currentDesc}`;
            }

            if (!fs.existsSync(kappaPath)) {
                this.logger.warning("[KappaMarker] kappaQuests.json not found.");
                return;
            }
        }

        this.logger.info("[KappaMarker] Quest descriptions updated.");
    }
}
