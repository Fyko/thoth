use std::sync::Arc;

use twilight_gateway::Event;

use crate::context::Context;

pub async fn handle_event(id: u64, event: Event, ctx: Arc<Context>) {
    match event {
        Event::Ready(ready) => {
            tracing::info!(
                "[event:ready] shard {id} ready with {} guilds; sid: {}; v{}",
                ready.guilds.len(),
                ready.session_id,
                ready.version
            );
        }
        Event::GatewayReconnect => {
            tracing::info!("[event:gwreconnect]: shard {id} gateway reconnecting");
        }

        Event::GuildCreate(guild) => {
            if !guild.unavailable {
                ctx.guilds.lock().unwrap().insert(guild.id.get());
            }
        }

        Event::GuildDelete(guild) => {
            tracing::info!("[event::guilddelete] shard {id} guild delete {}", guild.id);
            if !guild.unavailable {
                ctx.guilds.lock().unwrap().remove(&guild.id.get());
            }
        }

        _ => tracing::debug!("Shard: {id}, Event: {:?}", event.kind()),
    }
}
