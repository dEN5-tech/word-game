// src/state.rs

use crate::types::RoomCommand;
use crate::yandex_dictionary::WordDefinitionService;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::mpsc;
use uuid::Uuid;

pub type RoomCommandTx = mpsc::Sender<RoomCommand>;

#[derive(Clone)]
pub struct AppState {
    pub definition_service: Arc<WordDefinitionService>,
    pub rooms: Arc<DashMap<Uuid, RoomCommandTx>>,
}
