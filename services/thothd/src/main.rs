pub mod config;
pub mod context;
pub mod gateway;
pub mod metrics;
pub mod queue;

#[macro_use]
extern crate lazy_static;

#[macro_use]
extern crate prometheus;

use crate::context::Context;
use crate::queue::GatewayQueue;
use ::config::Config;
use axum::{routing::get, Router};
use futures::StreamExt;
use std::sync::Arc;
use tracing_subscriber::EnvFilter;
use twilight_gateway::{Cluster, EventTypeFlags, Intents};

const BOT_EVENTS: EventTypeFlags = EventTypeFlags::from_bits_truncate(
    EventTypeFlags::READY.bits()
        | EventTypeFlags::GUILD_CREATE.bits()
        | EventTypeFlags::GUILD_DELETE.bits()
        | EventTypeFlags::SHARD_CONNECTED.bits(),
);

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let config: crate::config::Config = Config::builder()
        .add_source(::config::File::with_name("thothd").required(false))
        .add_source(
            ::config::Environment::with_prefix("THOTHD")
                .try_parsing(true)
                .separator("_"),
        )
        .build()?
        .try_deserialize()?;

    let http_client = Arc::new(
        twilight_http::client::Client::builder()
            .token(config.token.clone())
            .build(),
    );

    let queue_url = format!("http://{}:{}", config.gateway.host, config.gateway.port);
    let gateway_queue = Arc::new(GatewayQueue(queue_url));

    let builder = Cluster::builder(config.token.clone(), Intents::GUILDS)
        .http_client(http_client.clone())
        .event_types(BOT_EVENTS)
        .queue(gateway_queue);

    let (cluster, mut events) = builder.build().await?;
    let cluster = Arc::new(cluster);

    let cluster_spawn = Arc::clone(&cluster);

    let context = Arc::new(Context::default());
    tokio::spawn(async move {
        cluster_spawn.up().await;
    });

    let context_clone = Arc::clone(&context);
    let app = Router::new().route(
        "/metrics",
        get(move || metrics::serve_metrics(context_clone)),
    );

    tokio::spawn(async move {
        let addr = ([0, 0, 0, 0], 2397).into();
        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    });

    let context_clone = Arc::clone(&context);
    while let Some((id, event)) = events.next().await {
        let ctx = context_clone.clone();
        tokio::spawn(async move { gateway::handle_event(id, event, ctx) });
    }

    Ok(())
}
