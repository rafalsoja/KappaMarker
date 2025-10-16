import { DependencyContainer } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IDatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { Quests } from "./quests";
import * as fs from "fs";
import * as path from "path";

class KappaMarkerMod implements IPostDBLoadMod {
  public postDBLoad(container: DependencyContainer): void {
    const logger = container.resolve<ILogger>("WinstonLogger");
    const databaseServer = container.resolve<IDatabaseServer>("DatabaseServer");
    const tables = databaseServer.getTables();

    const quests = new Quests(logger, tables);

    // Wczytaj konfigurację moda
    const configPath = path.join(__dirname, "..", "config", "modConfig.json");
    let config: {
      generateKappaList: boolean;
      markDescriptions: boolean;
      markNames: boolean;
    };

    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (err) {
      logger.error(`[KappaMarker] Failed to read modConfig.json: ${err}`);
      return;
    }

    const kappaPath = path.join(__dirname, "..", "db", "kappaQuests.json");

    // Generates Kappa quest list if it doesn't exist
    if (!fs.existsSync(kappaPath)) {
      logger.info("[KappaMarker] kappaQuests.json not found, generating...");
      quests.generateKappaQuestList();
    }

    let kappaQuestIds: string[] = [];
    try {
      const raw = fs.readFileSync(kappaPath, "utf-8");
      kappaQuestIds = JSON.parse(raw);
    } catch (err) {
      logger.error(
        `[KappaMarker] Failed to read or parse kappaQuests.json: ${err}`
      );
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
