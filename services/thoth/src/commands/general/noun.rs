use crate::commands::{handle_generic_error, text_response};
use crate::datamuse::{fetch_datamuse, trim_array, DatamuseQuery};
use crate::limit::SearchLimit;
use crate::state::ThothState;
use indoc::formatdoc;
use vesper::prelude::*;

#[tracing::instrument(skip(ctx))]
#[command]
#[description = "Responds with nouns that are often described by your query."]
#[error_handler(handle_generic_error)]
pub async fn noun(
    ctx: &SlashContext<ThothState>,
    #[description = "The adjective to search relevant nouns for (eg: yellow)."] word: String,
    #[description = "The maximum amount of results to return (max & default: 50)."] limit: Option<
        SearchLimit,
    >,
    #[description = "Whether or not to hide the command response from other users (default: True)."]
    hide: Option<bool>,
) -> DefaultCommandResult {
    let limit = limit.map(|l| l.0 as usize).unwrap_or(25);

    let words = fetch_datamuse(DatamuseQuery::Noun, &word)
        .await?
        .into_iter()
        .map(|w| w.word)
        .collect::<Vec<_>>();
    let found_count = words.len();
    let words = trim_array(words, limit).join(", ");

    let content = formatdoc! {"
		I found `{found_count}` nouns for `{word}`:
		
		{words}
	"};

    text_response(ctx, content, hide.unwrap_or(true)).await
}
