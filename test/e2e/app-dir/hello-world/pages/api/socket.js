import { Server } from 'socket.io'

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log('Server already started!')
    res.end()
    return
  }

  const io = new Server(res.socket.server, {
    path: '/api/my_awesome_socket',
  })
  res.socket.server.io = io

  const onConnection = (socket) => {
    const transport = socket.conn.transport.name

    socket.conn.on('upgrade', () => {
      const upgradedTransport = socket.conn.transport.name

      console.log(
        'server:Transport was upgraded',
        transport,
        '->',
        upgradedTransport
      )
    })

    socket.on('createdMessage', (msg) => {
      socket.broadcast.emit('newIncomingMessage', msg)
    })
  }

  io.on('connection', onConnection)

  io.engine.on('connection_error', (err) => {
    console.log(err.req) // the request object
    console.log(err.code) // the error code, for example 1
    console.log(err.message) // the error message, for example "Session ID unknown"
    console.log(err.context) // some additional error context
  })

  console.log('Socket server started successfully!')
  res.end()
}
