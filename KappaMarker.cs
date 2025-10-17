using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Models.Spt.Mod;
using SPTarkov.Server.Core.Models.Utils;
using SPTarkov.Server.Core.Services;

namespace _KappaMarker;

public record ModMetadata : AbstractModMetadata
{
    public override string ModGuid { get; init; } = "com.cichaj.km";
    public override string Name { get; init; } = "KappaMarker";
    public override string Author { get; init; } = "Cichaj";
    public override List<string>? Contributors { get; init; }
    public override SemanticVersioning.Version Version { get; init; } = new("2.0.0");
    public override SemanticVersioning.Range SptVersion { get; init; } = new("~4.0.0");
    public override List<string>? Incompatibilities { get; init; }
    public override Dictionary<string, SemanticVersioning.Range>? ModDependencies { get; init; }
    public override string? Url { get; init; } = "https://github.com/rafalsoja/KappaMarker";
    public override bool? IsBundleMod { get; init; } = false;
    public override string? License { get; init; } = "MIT";
}
[Injectable(TypePriority = OnLoadOrder.PostDBModLoader + 1)]
public class KappaMarker(ISptLogger<KappaMarker> logger, DatabaseService databaseService) : IOnLoad
{
    public Task OnLoad()
    {
        try
        {
            string? collectorId = FindCollectorQuestId(databaseService);
            if (string.IsNullOrWhiteSpace(collectorId))
            {
                logger.Warning("[KappaMarker] Collector quest not found.");
                return Task.CompletedTask;
            }

            var requiredQuests = GetAllRequiredQuests(databaseService, collectorId);
            if (requiredQuests == null || requiredQuests.Count == 0)
            {
                logger.Warning("[KappaMarker] No required quests found for Collector.");
                return Task.CompletedTask;
            }

            TagKappaQuestLocales(databaseService, requiredQuests, logger);
            logger.Success($"[KappaMarker] {requiredQuests.Count} quests marked.");
        }
        catch (Exception ex)
        {
            logger.Error($"[KappaMarker] Error: {ex.Message}");
        }

        return Task.CompletedTask;
    }

    private string? FindCollectorQuestId(DatabaseService db)
    {
        var quests = db.GetQuests();

        foreach (var (questId, questData) in quests)
        {
            if (questData.QuestName != null && questData.QuestName.Equals("Collector", StringComparison.OrdinalIgnoreCase))
            {
                return questId;
            }
        }
        return null;
    }
    private HashSet<string> GetAllRequiredQuests(DatabaseService db, string rootQuestId)
    {
        var quests = db.GetQuests();
        var visited = new HashSet<string>();

        void Traverse(string questId)
        {
            if (!quests.ContainsKey(questId) || visited.Contains(questId))
                return;

            visited.Add(questId);

            var quest = quests[questId];
            var conditions = quest.Conditions?.AvailableForStart;

            if (conditions == null)
                return;

            foreach (var cond in conditions)
            {
                if (cond.ConditionType == "Quest" && cond.Target != null)
                {
                    if (cond.Target.Item != null)
                    {
                        Traverse(cond.Target.Item);
                    }

                    if (cond.Target.List != null)
                    {
                        foreach (var id in cond.Target.List)
                        {
                            Traverse(id);
                        }
                    }
                }
            }
        }

        Traverse(rootQuestId);
        visited.Remove(rootQuestId);

        return visited;
    }

    private void TagKappaQuestLocales(DatabaseService databaseService, IEnumerable<string> questIds, ISptLogger<KappaMarker> logger)
    {
        foreach (var questId in questIds)
        {
            string descKey = $"{questId} description";
            string nameKey = $"{questId} name";

            foreach (var (localeCode, lazyLocale) in databaseService.GetLocales().Global)
            {
                lazyLocale.AddTransformer(locale =>
                {
                    if (locale.ContainsKey(descKey) && !locale[descKey].StartsWith("Required for Kappa"))
                    {
                        locale[descKey] = "Required for Kappa.\n\n" + locale[descKey];
                    }

                    if (locale.ContainsKey(nameKey) && !locale[nameKey].StartsWith("[K] "))
                    {
                        locale[nameKey] = "[K] " + locale[nameKey];
                    }

                    return locale;
                });
            }
        }
    }
}