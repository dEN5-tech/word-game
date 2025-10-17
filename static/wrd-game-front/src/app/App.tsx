import { useState, useEffect, useRef } from 'preact/hooks'
import { Lobby } from '../features/Lobby/ui/Lobby'
import { Connecting } from '../features/Connecting/ui/Connecting'
import { Game } from '../features/Game/ui/Game'
import { applyTelegramTheme } from '../shared/ui/theme'
import type { ConnectionStatus, GameState } from '../entities/Game/types'

export function App() {
  // UI State: Controls what the user sees
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [roomId, setRoomId] = useState<string>('')

  // Ref for the WebSocket instance
  const socketRef = useRef<WebSocket | null>(null)

  // Side Effects (useEffect for WebSocket)
  useEffect(() => {
    return () => {
      socketRef.current?.close()
    }
  }, [])

  // Apply initial Telegram theme
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      applyTelegramTheme(window.Telegram.WebApp.themeParams)
    }
  }, [])

  // Theme change listener
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const handleThemeChange = (event: any) => {
        applyTelegramTheme(event.theme_params)
      }
      window.Telegram.WebApp.onEvent('theme_changed', handleThemeChange)
      return () => {
        window.Telegram.WebApp.offEvent('theme_changed', handleThemeChange)
      }
    }
  }, [])

  // Connection Logic
  const connect = (command: 'create' | 'join', roomId: string) => {
    if (socketRef.current) {
      socketRef.current.onclose = null
      socketRef.current.close()
    }

    setConnectionStatus('connecting')
    setIsGameOver(false)
    setGameState(null)
    setRoomId(roomId)

    const socket = new WebSocket(`ws://localhost:3000/ws/${command}/${roomId}`)
    socketRef.current = socket

    socket.onopen = () => {
      setConnectionStatus('connected')
    }

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      switch(msg.type) {
        case 'RoomCreated':
          setRoomId(msg.room_id)
          break
        case 'UpdateState':
          setGameState(msg)
          break
        case 'GameOver':
          setIsGameOver(true)
          setGameState(state => state ? { ...state, timer: 0 } : null)
          socket.close()
          break
        case 'Error':
          alert(`Error: ${msg.message}`)
          setConnectionStatus('error')
          socket.close()
          break
      }
    }

    socket.onclose = () => {
      setConnectionStatus('disconnected')
      if (!isGameOver) {
        console.log('WebSocket closed unexpectedly.')
      }
    }

    socket.onerror = (err) => {
      setConnectionStatus('error')
      console.error('WebSocket Error:', err)
    }
  }

  // Event Handlers
  const handleCreateRoom = () => connect('create', '0')
  const handleJoinRoom = (roomId: string) => connect('join', roomId)
  const handleLeaveRoom = () => {
    socketRef.current?.close()
    setGameState(null)
    setIsGameOver(false)
  }
  const handleSubmitWord = (word: string) => {
    if (socketRef.current) {
      const msg = { type: 'SubmitWord', word }
      socketRef.current.send(JSON.stringify(msg))
    }
  }

  // Render Logic
  if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
    return <Lobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
  }

  if (connectionStatus === 'connecting') {
    return <Connecting />
  }

  return <Game gameState={gameState} isGameOver={isGameOver} roomId={roomId} onLeaveRoom={handleLeaveRoom} onSubmitWord={handleSubmitWord} />
}
