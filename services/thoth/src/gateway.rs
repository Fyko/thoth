use anyhow::Result;
use tokio::task::JoinSet;
use twilight_gateway::{stream, Config, Event, EventTypeFlags, Intents, Shard};

use crate::{commands::ThothFramework, config::CONFIG, state::ThothState};

const BOT_EVENTS: EventTypeFlags = EventTypeFlags::from_bits_truncate(
    EventTypeFlags::READY.bits()
        | EventTypeFlags::GUILD_CREATE.bits()
        | EventTypeFlags::GUILD_DELETE.bits()
        | EventTypeFlags::INTERACTION_CREATE.bits(),
);

pub async fn create_gateway(state: ThothState, framework: ThothFramework) -> Result<()> {
    let config = Config::builder(CONFIG.discord_token.clone(), Intents::GUILDS)
        .event_types(BOT_EVENTS)
        .build();

    let shards =
        stream::create_recommended(&state.http_client, config, |_, builder| builder.build())
            .await?;
    let mut set = JoinSet::new();

    for mut shard in shards {
        let state = state.clone();
        let framework = framework.clone();
        set.spawn(async move {
            shard_runner(state, framework, &mut shard).await;
        });
    }

    while set.join_next().await.is_some() {}

    Ok(())
}

async fn shard_runner(state: ThothState, framework: ThothFramework, shard: &mut Shard) {
    loop {
        let event = match shard.next_event().await {
            Ok(event) => event,
            Err(source) => {
                tracing::warn!(?source, "error recieving event");
                continue;
            }
        };

        let state = state.clone();
        let id = shard.id();
        let framework = framework.clone();
        tokio::spawn(async move {
            state.discord_cache.update(&event);

            match event {
                Event::Ready(_) => {
                    tracing::info!("Shard {} is ready", id);
                }
                Event::InteractionCreate(interaction) => {
                    framework.process(interaction.0).await;
                }
                _ => tracing::debug!("event: {:?}", event.kind()),
            }
        });
    }
}
