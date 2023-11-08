use std::{collections::HashMap, fmt::Display};

use anyhow::Result;
use serde::{Deserialize, Serialize};
use url_search_params::build_url_search_params;

pub type DatamuseResult = Vec<DatamuseHit>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatamuseHit {
    pub word: String,
    pub score: i32,
}

#[derive(Debug)]
pub enum DatamuseQuery {
    Adjective,
    CloseRhyme,
    Holonym,
    Homophone,
    Hyponym,
    MatchWord,
    Noun,
    Rhyme,
    MeansLike,
    SpelledLike,
	SoundsLike,
	Triggers,
}

impl Display for DatamuseQuery {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let word = match self {
            Self::Adjective => "rel_jjb",
            Self::CloseRhyme => "rel_nry",
            Self::Holonym => "rel_com",
            Self::Homophone => "rel_hom",
            Self::Hyponym => "rel_gen",
            Self::MatchWord => "sp",
            Self::Noun => "rel_jja",
            Self::Rhyme => "rel_rhy",
            Self::MeansLike => "ml",
            Self::SpelledLike => "sp",
			Self::SoundsLike => "sl",
			Self::Triggers => "rel_trg"
        };

        f.write_str(word)
    }
}

/// performs a query on the datamuse api
pub async fn fetch_datamuse(query: DatamuseQuery, word: &String) -> Result<DatamuseResult> {
    let url = format!("https://api.datamuse.com/words?{}={}", query, word);

    let response = reqwest::get(url).await?.json::<DatamuseResult>().await?;

    Ok(response)
}

/// performs a query on the datamuse api with a spelled-like paramater
pub async fn fetch_datamuse_raw(query: HashMap<String, String>) -> Result<DatamuseResult> {
    let qs = build_url_search_params(query);
    let url = format!("https://api.datamuse.com/words?{qs}");

    let response = reqwest::get(url).await?.json::<DatamuseResult>().await?;

    Ok(response)
}

/// shortens an array to a max length
pub fn trim_array(mut array: Vec<String>, max_len: usize) -> Vec<String> {
    if array.len() > max_len {
        let len = array.len() - max_len;
        array.truncate(max_len);
        // new_array.push(len as T);
        let more = format!("{} more...", len);
        array.push(more);

        return array;
    }

    array.to_vec()
}
