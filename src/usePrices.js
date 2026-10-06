import { useEffect, useState } from 'react'

export function usePrices(symbols) {
  const [prices, setPrices] = useState({}) // { BTC: 105000.5, ETH: 3800.1, ... }
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    // адрес вида: btcusdt@miniTicker/ethusdt@miniTicker/...
    const streams = symbols
      .map((s) => `${s.toLowerCase()}usdt@miniTicker`)
      .join('/')

    let ws
    let timer
    let stopped = false
    let attempt = 0

    const connect = () => {
      ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)

      ws.onopen = () => {
        attempt = 0
        setStatus('live')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data).data
        const symbol = data.s.replace('USDT', '') // "BTCUSDT" -> "BTC"
        setPrices((prev) => ({ ...prev, [symbol]: parseFloat(data.c) }))
      }

      ws.onclose = () => {
        if (stopped) return
        setStatus('reconnecting')
        // переподключение: 1с, 2с, 4с ... максимум 15с
        timer = setTimeout(connect, Math.min(1000 * 2 ** attempt++, 15000))
      }
    }

    connect()

    // cleanup: закрываем соединение, когда компонент удаляется
    return () => {
      stopped = true
      clearTimeout(timer)
      ws.close()
    }
  }, [symbols])

  return { prices, status }
}