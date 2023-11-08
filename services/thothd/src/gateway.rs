use std::sync::Arc;

use twilight_gateway::Event;

use crate::context::Context;

pub fn handle_event(shard_id: u64, event: Event, ctx: Arc<Context>) {
    match event {
        Event::Ready(ready) => {
            tracing::info!(
                "[event:ready] shard {shard_id} ready with {} guilds; sid: {}; v{}",
                ready.guilds.len(),
                ready.session_id,
                ready.version
            );
        }
        Event::GatewayReconnect => {
            tracing::info!("[event:gwreconnect]: shard {shard_id} gateway reconnecting");
        }

        Event::GuildCreate(guild) => {
            tracing::info! {
                target: "guild_create",
                "received {} ({})",
                guild.name,
                guild.id,
            }
            if !guild.unavailable {
                ctx.guilds.lock().unwrap().insert(guild.id.get());
            }
        }

        Event::GuildDelete(guild) => {
            tracing::info!(
                "[event::guilddelete] shard {shard_id} guild delete {}",
                guild.id
            );
            if !guild.unavailable {
                ctx.guilds.lock().unwrap().remove(&guild.id.get());
            }
        }

        _ => tracing::debug!("shard {shard_id} emitted {:?}", event.kind()),
    }
}
