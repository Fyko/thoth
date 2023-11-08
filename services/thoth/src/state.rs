use std::{sync::Arc, time::Duration};

use twilight_cache_inmemory::InMemoryCache;
use twilight_http::client::InteractionClient;

use crate::config::CONFIG;

pub type ThothState = Arc<InnerThothState>;

#[derive(Debug)]
pub struct InnerThothState {
    pub discord_cache: Arc<InMemoryCache>,
    pub db: sqlx::PgPool,
    pub http_client: Arc<twilight_http::Client>,
}

impl InnerThothState {
    pub async fn new() -> Self {
        let discord_cache = Arc::new(InMemoryCache::builder().message_cache_size(10).build());
        let db = sqlx::PgPool::connect(&CONFIG.database_url).await.unwrap();

        Self {
            discord_cache,
            db,
            http_client: Arc::new(Self::http_client()),
        }
    }

    pub fn http_client() -> twilight_http::Client {
        twilight_http::Client::builder()
            .token(CONFIG.discord_token.clone())
            .timeout(Duration::from_secs(10))
            .build()
    }

    pub fn interactions_client(&self) -> Arc<InteractionClient> {
        Arc::new(self.http_client.interaction(CONFIG.discord_application_id))
    }
}
