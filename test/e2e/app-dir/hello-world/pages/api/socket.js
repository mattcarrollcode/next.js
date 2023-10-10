import { Server } from 'socket.io'

export default function handler(req, res) {
  // console.log("req", req)
  if (res.socket.server.io) {
    console.log('Server already started!')
    res.end()
    return
  }

  const io = new Server(res.socket.server, {
    path: '/api/my_awesome_socket',
    // serveClient: false
  })
  res.socket.server.io = io

  const onConnection = (socket) => {
    console.log('New connection', socket.id)

    // console.log('eq headers', socket.handshake.headers ); // prints "true"

    const transport = socket.conn.transport.name // in most cases, "polling"

    socket.conn.on('upgrade', () => {
      const upgradedTransport = socket.conn.transport.name // in most cases, "websocket"

      console.log(
        'server:Transport was upgraded',
        transport,
        '->',
        upgradedTransport
      )
    })

    console.log('initial transport', socket.conn.transport.name) // prints "polling"

    socket.conn.once('upgrade', () => {
      // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
      console.log('upgraded transport', socket.conn.transport.name) // prints "websocket"
    })

    socket.conn.on('packet', ({ type, data }) => {
      // console.log('packet', type, data)
      // called for each packet received
    })

    socket.conn.on('packetCreate', ({ type, data }) => {
      // console.log('packetCreate', type, data)
      // called for each packet sent
    })

    socket.conn.on('drain', () => {
      console.log('drain')
      // called when the write buffer is drained
    })

    socket.conn.on('close', (reason) => {
      console.log('close', reason)
      // called when the underlying connection is closed
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
