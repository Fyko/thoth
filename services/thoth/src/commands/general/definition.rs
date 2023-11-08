use crate::commands::{handle_generic_error, text_response};
use crate::state::ThothState;
use rand::seq::SliceRandom;
use vesper::prelude::*;

static PONGS: [&'static str; 12] = [
    "Uhh, hello?",
    "What can I do ya' for?",
    "Why are you bothering me?",
    "Mhm?",
    "Yea?",
    "What's with you puny humans and the constant desire to bother me?",
    "Out of everyone here, you chose to bother me?",
    "So *this* is the meaning of life?",
    "Can we just get this over with?? I have stuff to do.",
    "That's all?",
    "Pong!",
    "Do it again. I dare you.",
];

#[tracing::instrument(skip(ctx))]
#[command]
#[description = "Ensures the bot is responding to commands."]
#[error_handler(handle_generic_error)]
pub async fn definition(ctx: &SlashContext<ThothState>) -> DefaultCommandResult {
    let pong = PONGS.choose(&mut rand::thread_rng()).unwrap();

    text_response(ctx, pong.to_string(), true).await
}
