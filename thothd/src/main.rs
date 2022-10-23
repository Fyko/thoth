#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate prometheus;
use prometheus::{Encoder, IntCounter, TextEncoder, IntGauge};

use futures::StreamExt;
use hyper::Uri;
use std::{env, future::Future, pin::Pin, sync::Arc};
use twilight_gateway::{queue::Queue, Cluster, Event, EventTypeFlags, Intents};

lazy_static! {
    static ref GUILD_COUNTER: IntGauge =
        register_int_gauge!("thoth_metrics_guilds", "Number of guilds").unwrap();
    static ref USER_COUNTER: IntCounter =
        register_int_counter!("thoth_metrics_users", "Number of users").unwrap();
}

const BOT_EVENTS: EventTypeFlags = EventTypeFlags::from_bits_truncate(
    EventTypeFlags::READY.bits()
        | EventTypeFlags::GUILD_CREATE.bits()
        | EventTypeFlags::GATEWAY_HEARTBEAT.bits(),
);

fn queue() -> anyhow::Result<GatewayQueue> {
    let host = env::var("GATEWAY_HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port: u16 = env::var("GATEWAY_PORT")
        .unwrap_or_else(|_| "80".into())
        .parse()?;
    let url = format!("http://{}:{}", host, port);
    println!("gateway queue at {}", url);

    Ok(GatewayQueue(url))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let http_client = Arc::new(
        twilight_http::client::Client::builder()
            .token(env::var("DISCORD_TOKEN")?)
            .build(),
    );

    let gateway_queue = Arc::new(queue()?);

    let builder = Cluster::builder(env::var("DISCORD_TOKEN")?, Intents::GUILDS)
        .http_client(http_client.clone())
        .event_types(BOT_EVENTS)
        .queue(gateway_queue);

    let (cluster, mut events) = builder.build().await?;
    let cluster = Arc::new(cluster);

    let cluster_spawn = Arc::clone(&cluster);

    tokio::spawn(async move {
        cluster_spawn.up().await;
    });

    // create a very simple server that will serve the metrics endpoint
    let addr = ([0, 0, 0, 0], 2397).into();
    let make_svc = hyper::service::make_service_fn(|_conn| async {
        Ok::<_, hyper::Error>(hyper::service::service_fn(|req| {
            let uri = req.uri().clone();
            async move {
                let mut response = hyper::Response::new(hyper::Body::empty());

                let mut buffer = Vec::new();
                let encoder = TextEncoder::new();
                let metric_families = prometheus::gather();
                encoder.encode(&metric_families, &mut buffer).unwrap();

                if uri.path() == "/metrics" {
                    *response.body_mut() = hyper::Body::from(buffer);
                    *response.headers_mut() = hyper::header::HeaderMap::new();
                    response.headers_mut().insert(
                        hyper::header::CONTENT_TYPE,
                        encoder.format_type().parse().unwrap(),
                    );
                } else {
                    *response.status_mut() = hyper::StatusCode::NOT_FOUND;
                }

                Ok::<_, hyper::Error>(response)
            }
        }))
    });

    let server = hyper::Server::bind(&addr).serve(make_svc);

    tokio::spawn(async move {
        if let Err(why) = server.await {
            tracing::error!("server error: {}", why);
        }
    });

    while let Some((id, event)) = events.next().await {
        // println!("Shard: {id}, Event: {:?}", event.kind());
        match event {
            Event::Ready(ready) => {
                tracing::info!(
                    "[event:ready] shard {id} ready with {} guilds; {} {}",
                    ready.guilds.len(),
                    ready.session_id,
                    ready.version
                );
                println!("{:?}", ready);
            }
            Event::GatewayReconnect => {
                tracing::info!("[event:gwreconnect]: shard {id} gateway reconnecting");
            }

            Event::GuildCreate(guild) => {
                tracing::info!(
                    "[event::guildcreate] shard {id} guild {} ({}) create with {} members",
                    guild.name,
                    guild.id,
                    guild.member_count.unwrap_or(0)
                );
                // tracing::debug!("guild: {:?}", guild);
                GUILD_COUNTER.inc();
                USER_COUNTER.inc_by(guild.member_count.unwrap_or(0));
            }

            Event::GuildDelete(guild) => {
                tracing::info!("[event::guilddelete] shard {id} guild delete {}", guild.id);
                if !guild.unavailable {
                    GUILD_COUNTER.dec();
                }
            }

            _ => tracing::debug!("Shard: {id}, Event: {:?}", event.kind()),
        }
    }

    Ok(())
}

#[derive(Debug, Clone)]
pub struct GatewayQueue(String);

impl Queue for GatewayQueue {
    fn request<'a>(&'a self, shard_id: [u64; 2]) -> Pin<Box<dyn Future<Output = ()> + Send + 'a>> {
        Box::pin(async move {
            let uri = format!("{}?shard={}", self.0, shard_id[0]);
            let req = hyper::Client::new().get(uri.parse::<Uri>().unwrap());
            tracing::info!("requesting gateway from {}", uri);

            if let Err(err) = req.await {
                tracing::error!("Error when connecting to gateway queue: {}", err);
            } else {
                tracing::info!("Shard {} passed gateway queue", shard_id[0]);
            }
        })
    }
}
