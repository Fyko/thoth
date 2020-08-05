use dotenv::dotenv;
use serde::Deserialize;

#[derive(Clone, Deserialize, Debug)]
pub struct Config {
    pub amqp_event: String,
    pub amqp_group: String,
    pub amqp_subgroup: String,
    pub amqp_url: String,

    pub discord_token: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            amqp_event: "REQUEST".into(),
            amqp_group: "rest".into(),
            amqp_subgroup: "".into(),
            amqp_url: "amqp://localhost".into(),
            discord_token: "".into(),
        }
    }
}

lazy_static! {
    pub static ref CONFIG: Config = get_config();
}

fn get_config() -> Config {
    dotenv().ok();

    match envy::from_env::<Config>() {
        Ok(config) => config,
        Err(error) => panic!("Configuration Error: {:#?}", error),
    }
}
