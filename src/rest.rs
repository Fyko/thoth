use crate::config::CONFIG;
use anyhow::Result;
use proxy::models::*;
use rustacles_brokers::amqp::AmqpBroker;
use serde_json::{from_slice, to_vec};
use std::collections::HashMap;
use tokio::time::{delay_for, timeout, Duration};

pub struct Rest {
    broker: AmqpBroker,
    default_headers: HashMap<String, String>,
}

impl Rest {
    pub async fn connect() -> Self {
        let broker: AmqpBroker = loop {
            let broker_res = AmqpBroker::new(
                &CONFIG.amqp_url,
                CONFIG.amqp_group.clone(),
                CONFIG.amqp_subgroup.clone().into(),
            )
            .await;

            if let Ok(b) = broker_res {
                break b.with_rpc().await.unwrap();
            } else {
                error!(
                    "Error when connecting to the broker: {:#?}",
                    broker_res.err()
                )
            }

            delay_for(Duration::from_secs(5)).await;
        };

        let mut default_headers = HashMap::new();
        default_headers.insert("Content-Type".to_owned(), "application/json".to_owned());
        default_headers.insert(
            "Authorization".to_owned(),
            format!("Bot {}", CONFIG.discord_token),
        );
        default_headers.insert("X-RateLimit-Precision".to_owned(), "millisecond".to_owned());

        Self {
            broker,
            default_headers,
        }
    }

    pub async fn me(&self) -> Result<RequestResponse<SerializableHttpResponse>> {
        let payload = SerializableHttpRequest {
            method: "GET".into(),
            path: "/users/@me".into(),
            query: None,
            body: None,
            headers: self.default_headers.clone(),
            timeout: None,
        };

        let response = timeout(
            Duration::from_secs(5),
            self.broker.call(
                &CONFIG.amqp_event,
                to_vec(&payload).unwrap(),
                Default::default(),
            ),
        )
        .await
        .unwrap()
        .unwrap();

        let response: RequestResponse<SerializableHttpResponse> =
            from_slice(&response.data).unwrap();

        Ok(response)
    }
}
