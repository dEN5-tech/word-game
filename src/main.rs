// src/main.rs

use dashmap::DashMap;
use std::{env, net::SocketAddr, sync::Arc};

// Подключаем наши новые модули
mod game;
mod state;
mod types;
mod web;
mod yandex_dictionary;

use state::AppState;
use yandex_dictionary::WordDefinitionService;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 1. Инициализация
    tracing_subscriber::fmt::init();
    dotenvy::dotenv().ok();

    // 2. Загрузка конфигурации и создание сервисов
    let api_key = env::var("YANDEX_API_KEY").expect("YANDEX_API_KEY must be set");
    let definition_service = Arc::new(WordDefinitionService::new(api_key));

    // 3. Создание глобального состояния
    let app_state = AppState {
        definition_service,
        rooms: Arc::new(DashMap::new()),
    };

    // 4. Создание роутера из веб-модуля
    let app = web::create_router(app_state);

    // 5. Запуск сервера
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("Сервер запущен на http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
