use std::sync::Arc;

use twilight_model::{
    application::interaction::Interaction,
    channel::message::MessageFlags,
    http::interaction::{InteractionResponse, InteractionResponseData, InteractionResponseType},
    user::User,
};
use vesper::{framework::DefaultError, prelude::*};

use crate::{
    config::CONFIG,
    state::{InnerThothState, ThothState},
};
mod general;
mod util;

pub type ThothFramework = Arc<Framework<ThothState, ()>>;

pub fn create_framework(state: ThothState) -> anyhow::Result<ThothFramework> {
    let http_client = InnerThothState::http_client();

    let framework = Framework::builder(http_client, CONFIG.discord_application_id, state)
        .command(general::adjective)
        .command(general::close_rhyme)
        .command(general::definition)
        .command(general::holonyms)
        .command(general::homophones)
        .command(general::hyponyms)
        .command(general::match_word)
        .command(general::noun)
        .command(general::rhyme)
        .command(general::similar_meaning)
        .command(general::similar_spelling)
        .command(general::sounds_like)
        .command(general::that_follow)
        .command(general::triggers)
        .command(util::ping)
        .build();

    Ok(Arc::new(framework))
}

pub fn user_from_interaction(interaction: &Interaction) -> User {
    if interaction.guild_id.is_some() {
        return interaction.member.clone().unwrap().user.unwrap();
    }

    interaction.user.clone().unwrap()
}

#[error_handler]
async fn handle_generic_error(ctx: &SlashContext<ThothState>, err: DefaultError) {
    tracing::error!("Error handling command: {:#?}", err);
    let _ = text_response(
        ctx,
        format!(
            r#"
			An unknown error occurred:
			```rs
			{:#?}
			```
		"#,
            err
        ),
        true,
    )
    .await;
}

/// Shorthand for editing the response to an interaction after being deferred.
pub async fn edit_response(
    ctx: &SlashContext<'_, ThothState>,
    text: String,
) -> DefaultCommandResult {
    ctx.interaction_client
        .update_response(&ctx.interaction.token)
        .content(Some(&text))
        .unwrap()
        .await?;

    Ok(())
}

/// Shorthand to creating a text response to an interaction.
pub async fn text_response(
    ctx: &SlashContext<'_, ThothState>,
    text: String,
    ephemeral: bool,
) -> DefaultCommandResult {
    ctx.interaction_client
        .create_response(
            ctx.interaction.id,
            &ctx.interaction.token,
            &InteractionResponse {
                kind: InteractionResponseType::ChannelMessageWithSource,
                data: Some(InteractionResponseData {
                    content: Some(text),
                    flags: if ephemeral {
                        Some(MessageFlags::EPHEMERAL)
                    } else {
                        None
                    },
                    ..Default::default()
                }),
            },
        )
        .await?;

    Ok(())
}

/// Shorthand to creating a text response to an interaction.
pub async fn create_followup(
    ctx: &SlashContext<'_, ThothState>,
    text: String,
    ephemeral: bool,
) -> DefaultCommandResult {
    let mut builder = ctx
        .interaction_client
        .create_followup(&ctx.interaction.token)
        .content(&text)?;

    if ephemeral {
        builder = builder.flags(MessageFlags::EPHEMERAL);
    }

    builder.await?;

    Ok(())
}
