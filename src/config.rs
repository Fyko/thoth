use dotenv::dotenv;
use serde::Deserialize;

#[derive(Clone, Deserialize, Debug)]
pub struct Config {
    #[serde(default = "Config::default_amqp_event")]
    pub amqp_event: String,
    #[serde(default = "Config::default_amqp_group")]
    pub amqp_group: String,
    #[serde(default)]
    pub amqp_subgroup: Option<String>,
    #[serde(default = "Config::default_amqp_url")]
    pub amqp_url: String,

    pub discord_token: String,
}

impl Config {
    fn default_amqp_url() -> String {
		"amqp://localhost:5672/%2f".into()
	}

	fn default_amqp_group() -> String {
		"rest".into()
	}

	fn default_amqp_event() -> String {
		"REQUEST".into()
	}
}

impl Default for Config {
    fn default() -> Self {
        Self {
            amqp_event: Self::default_amqp_event(),
            amqp_group: Self::default_amqp_group(),
            amqp_subgroup: None,
            amqp_url: Self::default_amqp_url(),
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
