import * as fs from "fs";
import * as path from "path";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { IQuest } from "@spt-aki/models/eft/quests/IQuest";

export class Quests {
  constructor(
    private logger: ILogger,
    private tables: IDatabaseTables
  ) {}

  private localesEN(): Record<string, string> {
    return this.tables.locales.global["en"];
  }

  private questDB(): Record<string, IQuest> {
    return this.tables.templates.quests;
  }

  public generateKappaQuestList(): void {
    const questDB = this.questDB();
    const locales = this.localesEN();

    const collectorEntry = Object.entries(locales).find(
      ([key, value]) =>
        key.endsWith(" name") && value.toLowerCase().includes("collector")
    );

    if (!collectorEntry) {
      this.logger.error("[KappaMarker] Could not find 'The Collector' quest.");
      return;
    }

    const collectorId = collectorEntry[0].replace(" name", "");
    this.logger.info(
      `[KappaMarker] Found 'The Collector' quest ID: ${collectorId}`
    );

    const visited = new Set<string>();

    const collectDependencies = (questId: string): void => {
      if (visited.has(questId)) return;
      visited.add(questId);

      const quest = questDB[questId];
      if (!quest?.conditions?.AvailableForStart) return;

      for (const condition of quest.conditions.AvailableForStart) {
        if (condition.conditionType === "Quest" && condition.target) {
          collectDependencies(condition.target);
        }
      }
    };

    collectDependencies(collectorId);

    const outputPath = path.join(__dirname, "..", "db", "kappaQuests.json");
    fs.writeFileSync(
      outputPath,
      JSON.stringify(Array.from(visited), null, 4),
      "utf-8"
    );

    this.logger.info(
      `[KappaMarker] Saved ${visited.size} Kappa quest IDs to ${outputPath}`
    );
  }
  public markKappaDescriptions(kappaQuestIds: string[]): void {
    const locales = this.tables.locales.global;
    let totalUpdated = 0;
    const updatedPerLang: Record<string, number> = {};

    for (const questId of kappaQuestIds) {
      const descKey = questId + " description";

      for (const lang in locales) {
        const currentDesc = locales[lang]?.[descKey];
        if (!currentDesc) continue;

        if (!currentDesc.includes("Required for Kappa")) {
          locales[lang][descKey] = `Required for Kappa.\n\n${currentDesc}`;
          totalUpdated++;
          updatedPerLang[lang] = (updatedPerLang[lang] || 0) + 1;
        }
      }
    }

    this.logger.info(
      `[KappaMarker] Updated ${totalUpdated} descriptions across ${Object.keys(updatedPerLang).length} languages.`
    );
  }
  public markKappaNames(kappaQuestIds: string[]): void {
    const locales = this.tables.locales.global;
    let totalUpdated = 0;
    const updatedPerLang: Record<string, number> = {};

    for (const questId of kappaQuestIds) {
      const nameKey = questId + " name";

      for (const lang in locales) {
        const currentName = locales[lang]?.[nameKey];
        if (!currentName) continue;

        if (!currentName.startsWith("[K]")) {
          locales[lang][nameKey] = `[K] ${currentName}`;
          totalUpdated++;
          updatedPerLang[lang] = (updatedPerLang[lang] || 0) + 1;
        }
      }
    }

    this.logger.info(
      `[KappaMarker] Updated ${totalUpdated} quest names across ${Object.keys(updatedPerLang).length} languages.`
    );
  }
}
