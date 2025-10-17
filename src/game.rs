// src/game.rs

use crate::types::{Player, RoomCommand, RoomState, ServerMessage};
use std::time::Duration;
use tokio::time::{interval};

pub async fn run_game_room(mut command_rx: tokio::sync::mpsc::Receiver<RoomCommand>) {
    let mut state = RoomState {
        challenge_word: "СТАРТ".to_string(),
        players: Default::default(),
        timer: 180,
    };
    let mut tick_interval = interval(Duration::from_secs(1));
    tracing::info!("Новая игровая комната запущена.");

    loop {
        tokio::select! {
            Some(command) = command_rx.recv() => {
                if handle_command(command, &mut state).await.is_err() { break; }
            }
            _ = tick_interval.tick() => {
                if state.timer > 0 { state.timer -= 1; } else { break; }
            }
        }
        broadcast_update(&state).await;
    }

    let final_score = state.players.values().next().map_or(0, |p| p.score);
    broadcast_message(&state, ServerMessage::GameOver { final_score }).await;
    tracing::info!("Игровая комната завершила работа.");
}

async fn handle_command(command: RoomCommand, state: &mut RoomState) -> Result<(), ()> {
    match command {
        RoomCommand::PlayerJoined { player_id, sender } => {
            state.players.insert(player_id, Player { score: 0, sender });
        }
        RoomCommand::PlayerLeft { player_id } => {
            state.players.remove(&player_id);
            if state.players.is_empty() { return Err(()); }
        }
        RoomCommand::ProcessWord { player_id, word } => {
            if let Some(player) = state.players.get_mut(&player_id) {
                player.score += 10;
                state.challenge_word = word;
            }
        }
    }
    Ok(())
}

async fn broadcast_update(state: &RoomState) {
    let message = ServerMessage::UpdateState {
        challenge_word: state.challenge_word.clone(),
        score: state.players.values().next().map_or(0, |p| p.score),
        timer: state.timer,
    };
    broadcast_message(state, message).await;
}

async fn broadcast_message(state: &RoomState, message: ServerMessage) {
    for player in state.players.values() {
        if player.sender.send(message.clone()).await.is_err() {
            tracing::warn!("Не удалось отправить сообщение игроку.");
        }
    }
}
