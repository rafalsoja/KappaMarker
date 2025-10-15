import { DependencyContainer } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IDatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { Quests } from "./quests";

class KappaMarkerMod implements IPostDBLoadMod {
    public postDBLoad(container: DependencyContainer): void {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const databaseServer = container.resolve<IDatabaseServer>("DatabaseServer");
        const tables = databaseServer.getTables();

        const quests = new Quests(logger, tables);
        quests.markKappaQuests();
    }
}

module.exports = { mod: new KappaMarkerMod() };
