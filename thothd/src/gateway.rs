use std::sync::Arc;

use twilight_gateway::Event;

use crate::{
    context::Context,
    metrics::{GUILD_GAUGE, USER_COUNTER},
};

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
            tracing::info!(
                "[event::guildcreate] shard {id} guild {} ({}) create with {} members",
                guild.name,
                guild.id,
                guild.member_count.unwrap_or(0)
            );
            if !guild.unavailable {
                ctx.guilds.lock().unwrap().insert(guild.id.get());
                USER_COUNTER.inc_by(guild.member_count.unwrap_or(0));
            }
        }

        Event::GuildDelete(guild) => {
            tracing::info!("[event::guilddelete] shard {id} guild delete {}", guild.id);
            if !guild.unavailable {
                GUILD_GAUGE.dec();
            }
        }

        _ => tracing::debug!("Shard: {id}, Event: {:?}", event.kind()),
    }
}
