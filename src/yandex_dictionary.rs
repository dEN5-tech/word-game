// src/yandex_dictionary.rs

use reqwest::Client;
use serde::{Deserialize, Serialize};

// --- 1. Определяем структуры для ответа (используя serde) ---

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct YandexApiResponse {
    pub def: Vec<Definition>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Definition {
    pub text: String,
    pub pos: Option<String>, // Part of speech
    pub ts: Option<String>,  // Transcription
    #[serde(rename = "tr")]
    pub translations: Vec<Translation>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Translation {
    pub text: String,
    pub pos: Option<String>,
    #[serde(default)] // Используем default, если поля нет в JSON
    pub syn: Vec<TextNode>,
    #[serde(default)]
    pub mean: Vec<TextNode>,
    #[serde(default)]
    pub ex: Vec<Example>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TextNode {
    pub text: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Example {
    pub text: String,
    #[serde(rename = "tr")]
    pub translations: Vec<TextNode>,
}


// --- 2. Пишем асинхронный сервис для запроса ---

#[derive(Clone)] // Clone нужен, чтобы сервис можно было использовать как состояние в Axum
pub struct WordDefinitionService {
    client: Client,
    api_key: String,
}

impl WordDefinitionService {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }

    /// Осуществляет поиск слова в Яндекс.Словаре.
    /// lang = "ru-ru" для получения толкования, а не перевода.
    pub async fn lookup(&self, word: &str, lang: &str) -> Result<Option<Definition>, reqwest::Error> {
        let url = format!(
            "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key={}&lang={}&text={}",
            self.api_key, lang, word
        );

        let response = self.client.get(&url).send().await?
            .json::<YandexApiResponse>()
            .await?;

        // Возвращаем первую словарную статью, если она есть
        Ok(response.def.into_iter().next())
    }
}
