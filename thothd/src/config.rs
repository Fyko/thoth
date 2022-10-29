use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub discord_token: String,
    pub gateway: Gateway,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Gateway {
    pub host: String,
    pub port: u16,
}
