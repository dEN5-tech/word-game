export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface GameState {
  challenge_word: string
  score: number
  timer: number
}
