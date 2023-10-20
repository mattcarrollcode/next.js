'use client'

import { useEffect, useState } from 'react'
import io from 'socket.io-client'

let socket

export default function Home() {
  const [value, setValue] = useState('')

  const socketInitializer = async () => {
    // We call this just to make sure we turn on the websocket server
    await fetch('/api/socket')

    socket = io(undefined, {
      path: '/api/my_awesome_socket',
    })

    socket.on('connect', () => {
      const transport = socket.io.engine.transport.name // in most cases, "polling"

      socket.io.engine.on('upgrade', () => {
        const upgradedTransport = socket.io.engine.transport.name // in most cases, "websocket"
        console.log(
          'client:Transport upgraded: ',
          transport,
          ' -> ',
          upgradedTransport
        )
      })
    })

    socket.on('newIncomingMessage', (msg) => {
      setValue(msg)
    })
  }

  const sendMessageHandler = async (e) => {
    if (!socket) return
    const value = e.target.value
    socket.emit('createdMessage', value)
  }

  useEffect(() => {
    socketInitializer()
  }, [])

  return (
    <main className="flex min-h-screen flex-col gap-8 items-center justify-start p-24 bg-pink-50">
      <input
        value={value}
        onChange={sendMessageHandler}
        className="w-full h-12 px-2 mt-auto rounded"
        placeholder="Enter some text and see the syncing of text in another tab"
      />
    </main>
  )
}
