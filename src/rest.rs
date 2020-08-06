use crate::config::CONFIG;
use anyhow::Result;
use proxy::models::*;
use rustacles_brokers::amqp::AmqpBroker;
use rustacles_model::{User, Snowflake};
use serde::{Serialize, Deserialize};
use serde_json::{from_slice, to_vec, from_value};
use serde_repr::{Deserialize_repr, Serialize_repr};
use std::collections::HashMap;
use tokio::time::{delay_for, timeout, Duration};

#[derive(Serialize_repr, Deserialize_repr, Debug, Clone)]
#[repr(u8)]
pub enum MembershipState {
    INVITED = 1,
    ACCEPTED
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TeamMember {
    /// the user's membership state on the team
    pub membership_state: MembershipState,
    /// will always be `["*"]`
    pub permissions: Vec<String>,
    /// the id of the parent team of which they are a member
    pub team_id: Snowflake,
    /// the avatar, discriminator, id, and username of the user
    pub user: User,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct Team {
    /// a hash of the image of the team's icon
    pub icon: Option<String>,
    /// the unique id of the team
    pub id: Snowflake,
    /// The members of the team
    pub members: Vec<TeamMember>,
    /// The user id of the current team owner
    pub owner_user_id: Snowflake,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct Application {
    /// The ID of this applicaiton.
    pub id: Snowflake,
    /// The name of this application.
    pub name: String,
    /// The icon hash of this applicaiton.
    pub icon: Option<String>,
    /// The description of this application
    pub description: String,
    /// An array of RPC origin urls, if RPC is enabled
    pub rpc_origins: Option<Vec<String>>,
    /// When false only app owner can join the app's bot to guilds.
    pub bot_public: bool,
    /// When true the app's bot will only join upon completion of the full oauth2 code grant flow
    pub bot_require_code_grant: bool,
    /// partial user object containing info on the owner of the application
    pub owner: User,
    /// If this application is a game sold on Discord, this field will be the summary field for the store page of its primary sku
    pub summary: String,
    /// The base64 encoded key for the GameSDK's GetTicket
    pub verify_key: String,
    /// if the application belongs to a team, this will be a list of the members of that team
    pub team: Option<Team>,
    /// if this application is a game sold on Discord, this field will be the guild to which it has been linked
    pub guild_id: Option<String>,
    /// If this application is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists
    pub primary_sku_id: Option<String>,
    /// If this application is a game sold on Discord, this field will be the URL slug that links to the store page
    pub slug: Option<String>,
    // If this application is a game sold on Discord, this field will be the hash of the image on store embeds
    pub cover_image: Option<String>,
}

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

    pub async fn request(&self, payload: SerializableHttpRequest) -> Result<RequestResponse<SerializableHttpResponse>> {
        let response = timeout(
            Duration::from_secs(5),
            self.broker.call(
                &CONFIG.amqp_event,
                to_vec(&payload).unwrap(),
                Default::default(),
            ),
        )
        .await.unwrap().unwrap();

        let response: Result<RequestResponse<SerializableHttpResponse>, _> =
            from_slice(&response.data);

        match response {
            Ok(response) => Ok(response),
            Err(err) => Err(anyhow::anyhow!(err))
        }
    }

    pub async fn get(&self, path: &str) -> Result<RequestResponse<SerializableHttpResponse>> {
        let payload = SerializableHttpRequest {
            method: "GET".into(),
            path: path.into(),
            query: None,
            body: None,
            headers: self.default_headers.clone(),
            timeout: None,
        };

        let response = self.request(payload).await.unwrap();

        Ok(response)
    }

    pub async fn me(&self) -> Result<User> {
        let response = self.get("/users/@me").await;

        let response: Result<User, _> = match response {
            Ok(res) => from_value(res.body.body),
            Err(err) => return Err(anyhow::anyhow!(err))
        };

        match response {
            Ok(user) => Ok(user),
            Err(err) => Err(anyhow::anyhow!(err))
        }
    }

    pub async fn application(&self) -> Result<Application> {
        let response = self.get("/oauth2/applications/@me").await;

        let response: Result<Application, _> = match response {
            Ok(res) => from_value(res.body.body),
            Err(err) => return Err(anyhow::anyhow!(err))
        };

        match response {
            Ok(app) => Ok(app),
            Err(err) => Err(anyhow::anyhow!(err))
        }
    }
}
