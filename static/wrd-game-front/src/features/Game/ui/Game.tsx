import { useState } from 'preact/hooks'
import { Typography, Card, CardContent, Box, Container, Paper, Button, TextField } from '@mui/material'
import type { h } from 'preact'
import type { GameState } from '../../../entities/Game/types'

interface GameProps {
  gameState: GameState | null
  isGameOver: boolean
  roomId: string
  onLeaveRoom: () => void
  onSubmitWord: (word: string) => void
}

export function Game({ gameState, isGameOver, roomId, onLeaveRoom, onSubmitWord }: GameProps) {
  const [wordInput, setWordInput] = useState<string>('')

  const handleSubmit = (e: h.JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault()
    onSubmitWord(wordInput)
    setWordInput('')
  }

  const onInputChange = (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
    setWordInput((e.target as HTMLInputElement).value)
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mt: 1 }}>
        Room ID: {roomId}
      </Typography>
      <Card sx={{ mt: 2, flexGrow: 1 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 2, letterSpacing: '.1em' }}>
            {gameState?.challenge_word || 'WAITING...'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Score
              </Typography>
              <Typography variant="h4">
                {gameState?.score || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Time Left
              </Typography>
              <Typography variant="h4">
                {gameState?.timer || 0}s
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      {isGameOver && (
        <Paper sx={{ mt: 2, p: 2, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="primary">
            Game Over!
          </Typography>
          <Typography variant="body1" gutterBottom>
            Your final score is {gameState?.score || 0}
          </Typography>
          <Button size="large" onClick={onLeaveRoom}>
            Back to Lobby
          </Button>
        </Paper>
      )}
      {!isGameOver && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 1 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
            <TextField
              fullWidth
              value={wordInput}
              onChange={onInputChange}
              placeholder="Type your word..."
            />
            <Button type="submit" variant="contained" size="large">
              Submit
            </Button>
          </form>
        </Paper>
      )}
    </Container>
  )
}
