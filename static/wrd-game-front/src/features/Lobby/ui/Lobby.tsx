import { useState } from 'preact/hooks'
import { Box, Typography, Button, TextField, Container, IconButton, Badge } from '@mui/material'
import { Settings } from '@mui/icons-material'
import type { h } from 'preact'

interface LobbyProps {
  onCreateRoom: () => void
  onJoinRoom: (roomId: string) => void
}

export function Lobby({ onCreateRoom, onJoinRoom }: LobbyProps) {
  const [showJoinForm, setShowJoinForm] = useState<boolean>(false)
  const [showPrivateForm, setShowPrivateForm] = useState<boolean>(false)
  const [roomInput, setRoomInput] = useState<string>('')

  const handleJoin = () => {
    onJoinRoom(roomInput)
    setRoomInput('')
  }

  const onInputChange = (e: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
    setRoomInput((e.target as HTMLInputElement).value)
  }

  const handleToggleJoin = () => setShowJoinForm(!showJoinForm)
  const handleTogglePrivate = () => setShowPrivateForm(!showPrivateForm)

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
        Word Arena
      </Typography>
      <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4, color: 'text.secondary' }}>
        Join a battle or create your own
      </Typography>

      {!showJoinForm && !showPrivateForm && (
        <>
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="primary">🔥 1,234 players battling now!</Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{ mb: 2, height: 60, fontSize: '1.2rem' }}
            onClick={() => onCreateRoom()} // Quick Play could auto-find/create
          >
            PLAY NOW
          </Button>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button variant="outlined" size="large" sx={{ flex: 1 }} onClick={handleTogglePrivate}>
              Create Private
            </Button>
            <Button variant="outlined" size="large" sx={{ flex: 1 }} onClick={handleToggleJoin}>
              Join with ID
            </Button>
          </Box>
        </>
      )}

      {showJoinForm && (
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleJoin(); }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            value={roomInput}
            onChange={onInputChange}
            placeholder="Enter Room ID..."
            autoFocus
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" sx={{ flex: 1 }}>
              Join Arena
            </Button>
            <Button variant="outlined" onClick={handleToggleJoin}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {showPrivateForm && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            Private Arena Created!
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: 'monospace' }}>
            ROOM-12345
          </Typography>
          <Button variant="contained" sx={{ mb: 1 }} onClick={() => navigator.share?.({ title: 'Word Arena', text: 'Join my Word Arena: ROOM-12345' })}>
            Share Room ID
          </Button>
          <Button variant="outlined" onClick={handleTogglePrivate}>
            Back
          </Button>
        </Box>
      )}

      <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
        <IconButton sx={{ bgcolor: 'background.paper' }}>
          <Badge variant="dot" color="primary">
            <Settings />
          </Badge>
        </IconButton>
      </Box>
    </Container>
  )
}
