// src/web.rs

use crate::{
    game::run_game_room,
    state::AppState,
    types::{ClientMessage, GetWordParams, RoomCommand, ServerMessage, WsCommand},
};
use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, Query, State, WebSocketUpgrade,
    },
    http::StatusCode,
    response::{IntoResponse, Json, Response},
    routing::get,
    Router,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde_json::to_value;
use tokio::sync::mpsc;
use tower_http::services::ServeDir;
use uuid::Uuid;

pub fn create_router(app_state: AppState) -> Router {
    Router::new()
        .route("/definition", get(get_word_definition_handler))
        .route("/ws/:command/:room_id", get(websocket_handler))
        .with_state(app_state)
        .fallback_service(ServeDir::new("static"))
}

async fn get_word_definition_handler(
    State(app_state): State<AppState>,
    Query(params): Query<GetWordParams>,
) -> impl IntoResponse {
    tracing::info!("Запрос определения для слова: {}", &params.word);

    match app_state.definition_service.lookup(&params.word, "ru-ru").await {
        Ok(Some(def)) => {
            (StatusCode::OK, Json(to_value(def).unwrap()))
        }
        Ok(None) => {
            (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Definition not found"})))
        }
        Err(e) => {
            tracing::error!("Ошибка при запросе к Яндекс.Словарю: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": "Error fetching definition from provider"})))
        }
    }
}

async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
    Path((command_str, room_id_str)): Path<(String, String)>,
) -> impl IntoResponse {
    let command = match command_str.parse::<WsCommand>() {
        Ok(c) => c,
        Err(_) => return (StatusCode::BAD_REQUEST, "Invalid command").into_response(),
    };

    match command {
        WsCommand::Create => {
            let room_id = Uuid::new_v4();
            let (command_tx, command_rx) = mpsc::channel(100);
            tokio::spawn(run_game_room(command_rx));
            state.rooms.insert(room_id, command_tx);
            tracing::info!("Создана новая комната по команде 'Create': {}", room_id);
            ws.on_upgrade(move |socket| handle_socket(socket, state, room_id))
        }
        WsCommand::Join => {
            if let Ok(room_id) = Uuid::parse_str(&room_id_str) {
                if state.rooms.contains_key(&room_id) {
                    ws.on_upgrade(move |socket| handle_socket(socket, state, room_id))
                } else {
                    (StatusCode::NOT_FOUND, "Room not found").into_response()
                }
            } else {
                (StatusCode::BAD_REQUEST, "Invalid Room ID format").into_response()
            }
        }
    }
}

async fn handle_socket(socket: WebSocket, state: AppState, room_id: Uuid) {
    let Some(command_tx) = state.rooms.get(&room_id).map(|entry| entry.value().clone()) else { return };

    let player_id = Uuid::new_v4();
    let (response_tx, mut response_rx) = mpsc::channel(10);

    let _ = response_tx.send(ServerMessage::RoomCreated { room_id }).await;

    if command_tx.send(RoomCommand::PlayerJoined { player_id, sender: response_tx }).await.is_err() { return };
    tracing::info!("Клиент {} присоединился к комнате {}.", player_id, room_id);

    let (mut socket_tx, mut socket_rx) = socket.split();

    let mut send_task = tokio::spawn(async move {
        while let Some(msg) = response_rx.recv().await {
            if socket_tx.send(Message::Text(serde_json::to_string(&msg).unwrap())).await.is_err() { break }
        }
    });

    let command_tx_clone = command_tx.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = socket_rx.next().await {
            if let Ok(ClientMessage::SubmitWord { word }) = serde_json::from_str(&text) {
                if command_tx_clone.send(RoomCommand::ProcessWord { player_id, word }).await.is_err() { break }
            }
        }
    });

    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };

    if command_tx.send(RoomCommand::PlayerLeft { player_id }).await.is_err() {
        tracing::debug!("Не удалось отправить PlayerLeft для игрока {}: канал комнаты уже закрыт.", player_id);
    }
    tracing::info!("Клиент {} отключился от комнаты {}.", player_id, room_id);

    if let Some(entry) = state.rooms.get(&room_id) {
        if entry.value().is_closed() {
            tracing::info!("Удаляем завершенную комнату {} из глобального состояния.", room_id);
            state.rooms.remove(&room_id);
        }
    }
}
