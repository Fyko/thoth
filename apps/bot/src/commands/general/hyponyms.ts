import type HyponymsCommand from "@thoth/interactions/commands/general/hyponyms";
import { Command } from "@yuudachi/framework";
import type {
  ArgsParam,
  InteractionParam,
  LocaleParam,
} from "@yuudachi/framework/types";
import i18n from "i18next";
import { parseLimit } from "#util/args.js";
import { DatamuseQuery, fetchDatamuse } from "#util/datamuse.js";
import { firstUpperCase, trimArray } from "#util/index.js";

export default class extends Command<typeof HyponymsCommand> {
  public override async chatInput(
    interaction: InteractionParam,
    args: ArgsParam<typeof HyponymsCommand>,
    lng: LocaleParam,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: args.hide ?? true });

    const limit = parseLimit(args.limit, lng);

    const words = await fetchDatamuse(DatamuseQuery.Hyponym, args.word).catch(
      () => null,
    );
    if (!words?.length)
      throw new Error(i18n.t("common.errors.not_found", { lng }));
    const mapped = words.map((h) => h.word);

    await interaction.editReply(
      i18n.t("commands.hyponyms.success", {
        found_count: words.length.toString(),
        word: firstUpperCase(args.word),
        words: trimArray(mapped, limit).join(", "),
        lng,
      }),
    );
  }
}
