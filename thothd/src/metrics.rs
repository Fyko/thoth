use std::sync::Arc;

use axum::{
    headers::HeaderMap,
    http::{self, StatusCode},
    response::IntoResponse,
};
use prometheus::{Encoder, IntGauge};

use crate::context::Context;

lazy_static! {
    pub static ref GUILD_GAUGE: IntGauge =
        register_int_gauge!("thoth_metrics_guilds", "Number of guilds").unwrap();
}

pub async fn serve_metrics(context: Arc<Context>) -> (HeaderMap, impl IntoResponse) {
    GUILD_GAUGE.set(context.guilds.lock().unwrap().len() as i64);

    let mut buffer = Vec::new();
    let encoder = prometheus::TextEncoder::new();
    let metric_families = prometheus::gather();
    encoder.encode(&metric_families, &mut buffer).unwrap();

    let mut headers = HeaderMap::new();
    headers.insert(
        http::header::CONTENT_TYPE,
        encoder.format_type().parse().unwrap(),
    );

    (headers, (StatusCode::OK, buffer))
}
