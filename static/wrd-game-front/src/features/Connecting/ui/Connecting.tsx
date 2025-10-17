import { Typography, Container, CircularProgress } from '@mui/material'

export function Connecting() {
  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Connecting...
      </Typography>
      <CircularProgress size={60} />
    </Container>
  )
}
