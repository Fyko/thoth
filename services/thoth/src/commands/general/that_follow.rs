use std::collections::HashMap;

use crate::commands::{handle_generic_error, text_response};
use crate::datamuse::{fetch_datamuse_raw, trim_array};
use crate::limit::SearchLimit;
use crate::state::ThothState;
use indoc::formatdoc;
use vesper::prelude::*;

#[tracing::instrument(skip(ctx))]
#[command("that-follow")]
#[description = "Responds with words that could logically follow query (starts-with or ends-with is required)."]
#[error_handler(handle_generic_error)]
pub async fn that_follow(
    ctx: &SlashContext<ThothState>,
    #[description = "The word to search following words for (eg: open)."] word: String,
    #[rename = "starts-with"]
    #[description = "Only return words that start with this value (mutually exclusive with ends-with)."]
    starts_with: Option<String>,
    #[rename = "ends-with"]
    #[description = "Only return words that end with this value (mutually exclusive with starts-with)."]
    ends_with: Option<String>,
    #[description = "The maximum amount of results to return (max & default: 50)."] limit: Option<
        SearchLimit,
    >,
    #[description = "Whether or not to hide the command response from other users (default: True)."]
    hide: Option<bool>,
) -> DefaultCommandResult {
    let limit = limit.map(|l| l.0 as usize).unwrap_or(25);

    if starts_with.is_some() && ends_with.is_some() {
        return text_response(ctx, "The `starts-with` and `ends-with` options are mutually exclusive -- you can't use them both at the same time.".to_string(), true).await;
    }

	if !starts_with.is_some() && !ends_with.is_some() {
		return text_response(ctx, "You must provide either `starts-with` or `ends-with`.".to_string(), true).await;
	}

    let mut query = HashMap::<String, String>::new();
    query.insert("lc".to_string(), word.clone());

    let sp = if let Some(sw) = &starts_with {
        Some(format!("{sw}*"))
    } else if let Some(ew) = &ends_with {
        Some(format!("*{ew}"))
    } else {
        None
    };

    if let Some(sp) = &sp {
        query.insert("sp".to_string(), sp.clone());
    }

    let words = fetch_datamuse_raw(query)
        .await?
        .into_iter()
        .map(|w| w.word)
        .collect::<Vec<_>>();

    let found_count = words.len();
    let words = trim_array(words, limit).join(", ");

    let content = if let Some(starts_with) = starts_with {
        formatdoc! {"
			I found `{found_count}` words that logically follow `{word}` and start with `{starts_with}`:
			
			{words}
		"}
    } else if let Some(ends_with) = ends_with {
        formatdoc! {"
			I found `{found_count}` words that logically follow `{word}` and end with `{ends_with}`:
			
			{words}
		"}
    } else {
        formatdoc! {"
			I found `{found_count}` words that logically follow `{word}`:
			
			{words}
		"}
    };

    text_response(ctx, content, hide.unwrap_or(true)).await
}
