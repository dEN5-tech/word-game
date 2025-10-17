// src/types.rs

use serde::{Deserialize, Serialize};
use std::str::FromStr;
use tokio::sync::mpsc;
use uuid::Uuid;

// --- Сообщения WebSocket ---

#[derive(Deserialize, Debug)]
#[serde(tag = "type")]
pub enum ClientMessage {
    SubmitWord { word: String },
}

#[derive(Serialize, Debug, Clone)]
#[serde(tag = "type")]
#[allow(dead_code)]
pub enum ServerMessage {
    RoomCreated {
        room_id: Uuid,
    },
    UpdateState {
        challenge_word: String,
        score: u32,
        timer: u32,
    },
    GameOver {
        final_score: u32,
    },
    Error {
        message: String,
    },
}

// --- Команды для URL и комнаты ---

#[derive(Debug)]
pub enum WsCommand {
    Create,
    Join,
}

impl FromStr for WsCommand {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "create" => Ok(WsCommand::Create),
            "join" => Ok(WsCommand::Join),
            _ => Err("invalid WebSocket command"),
        }
    }
}

#[derive(Debug)]
pub enum RoomCommand {
    PlayerJoined {
        player_id: Uuid,
        sender: mpsc::Sender<ServerMessage>,
    },
    PlayerLeft {
        player_id: Uuid,
    },
    ProcessWord {
        player_id: Uuid,
        word: String,
    },
}

// --- Структуры для состояния игры ---

pub struct Player {
    pub score: u32,
    pub sender: mpsc::Sender<ServerMessage>,
}

pub struct RoomState {
    pub challenge_word: String,
    pub players: std::collections::HashMap<Uuid, Player>,
    pub timer: u32,
}

// --- Типы для HTTP API ---

#[derive(Deserialize)]
pub struct GetWordParams {
    pub word: String,
}
