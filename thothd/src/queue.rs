use futures::Future;
use hyper::{Client, Uri};
use std::pin::Pin;
use twilight_gateway::queue::Queue;

#[derive(Debug, Clone)]
pub struct GatewayQueue(pub String);

impl Queue for GatewayQueue {
    fn request<'a>(&'a self, shard_id: [u64; 2]) -> Pin<Box<dyn Future<Output = ()> + Send + 'a>> {
        Box::pin(async move {
            let uri = format!("{}?shard={}", self.0, shard_id[0]);
            let req = Client::new().get(uri.parse::<Uri>().unwrap());
            tracing::info!("requesting gateway from {}", uri);

            if let Err(err) = req.await {
                tracing::error!("Error when connecting to gateway queue: {}", err);
            } else {
                tracing::info!("Shard {} passed gateway queue", shard_id[0]);
            }
        })
    }
}
