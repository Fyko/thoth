#[macro_use]
extern crate rust_i18n;

use std::sync::Arc;

use crate::commands::create_framework;
use crate::gateway::create_gateway;
use crate::state::{InnerThothState, ThothState};
use anyhow::Result;
use tracing_subscriber::{fmt, prelude::*, EnvFilter, Registry};

pub mod commands;
pub mod config;
pub mod datamuse;
pub mod gateway;
pub mod limit;
pub mod state;

i18n!("locales", fallback = "en-US");

#[tokio::main]
async fn main() -> Result<()> {
    Registry::default()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "debug,hyper=info,tower_http=info,rustls=info".into()),
        )
        .with(fmt::layer())
        .init();

    let state: ThothState = Arc::new(InnerThothState::new().await);
    let framework = create_framework(state.clone()).expect("Failed to create zephryus framework");

    let commands = framework
        .commands
        .values()
        .map(|c| c.name)
        .collect::<Vec<_>>()
        .join(", ");
    tracing::info!("Loaded commands: {:#?}", commands);

    let groups = framework
        .groups
        .values()
        .map(|g| g.name)
        .collect::<Vec<_>>()
        .join(", ");

    tracing::info!("Loaded groups: {:#?}", groups);

    let gateway = create_gateway(state.clone(), framework).await;

    tracing::info!("Gateway: {:#?}", gateway);

    Ok(())
}
