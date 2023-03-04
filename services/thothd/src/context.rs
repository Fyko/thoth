use std::{
    collections::HashSet,
    sync::{Arc, Mutex},
};

#[derive(Clone)]
pub struct Context {
    pub guilds: Arc<Mutex<HashSet<u64>>>,
}

impl Context {
    pub fn new() -> Self {
        let guilds = Arc::new(Mutex::new(HashSet::new()));

        Self { guilds }
    }
}

impl Default for Context {
    fn default() -> Self {
        Self::new()
    }
}
