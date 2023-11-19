import type { AutocompleteInteraction } from "discord.js";
import { container } from "tsyringe";
import { logger } from "#logger";
import type { RedisManager } from "#structures";
import { fetchAutocomplete, fetchTopWords } from "#util/mw/index.js";
import { kRedis } from "#util/symbols.js";

const redis = container.resolve<RedisManager>(kRedis);

export async function definitionAutoComplete(
  interaction: AutocompleteInteraction<"cached">,
) {
  const input = interaction.options.getFocused().trim();

  if (input) {
    const search = await fetchAutocomplete(redis, input);

    await interaction.respond(
      search.docs
        .filter((r) => r.ref === "owl-combined")
        .slice(0, 5)
        .map(({ word }) => ({ name: word, value: word })),
    );

    logger.debug(
      {
        input,
        interactionId: interaction.id,
        userId: interaction.user.id,
      },
      "performed autocomplete for definition command",
    );
  } else {
    const top = await fetchTopWords(redis);

    await interaction.respond([
      {
        name: "What are you looking for? Or select a trending Merriam-Webster query:",
        value: "no",
      },
      ...top.data.words
        .slice(0, 16)
        .map((word) => ({ name: word, value: word })),
    ]);

    logger.debug(
      {
        interactionId: interaction.id,
        userId: interaction.user.id,
      },
      "provided top words for definition command",
    );
  }
}
