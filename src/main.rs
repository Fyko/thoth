#[macro_use]
extern crate log;
#[macro_use]
extern crate lazy_static;

use crate::rest::Rest;
use env_logger::Env;

mod config;
mod rest;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::from_env(Env::default().default_filter_or("debug")).init();

    let rest = Rest::connect().await;
    let res = rest.me().await;

    match res {
        Ok(me) => println!("{:#?}", me),
        Err(err) => println!("Error: {:#?}", err.to_string()),
    }
}
