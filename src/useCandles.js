import { useEffect, useState } from 'react'

// История свечей (REST) + live-обновление последней свечи (WebSocket)
export function useCandles(symbol, interval) {
  const [candles, setCandles] = useState([]) // вся история, приходит один раз
  const [last, setLast] = useState(null)     // текущая свеча, обновляется постоянно

  useEffect(() => {
    const pair = `${symbol}USDT`
    let ws
    let timer
    let stopped = false
    let attempt = 0

    setCandles([])
    setLast(null)

    // 1. история: последние 500 свечей
    fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=500`)
      .then((r) => r.json())
      .then((raw) => {
        if (stopped) return
        setCandles(
          raw.map((k) => ({
            time: k[0] / 1000, // Binance даёт миллисекунды, графику нужны секунды
            open: +k[1],
            high: +k[2],
            low: +k[3],
            close: +k[4],
          }))
        )
      })
      .catch(() => {})

    // 2. live: одна свеча, которая меняется на каждом тике
    const connect = () => {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@kline_${interval}`)
      ws.onopen = () => { attempt = 0 }
      ws.onmessage = (e) => {
        const k = JSON.parse(e.data).k
        setLast({ time: k.t / 1000, open: +k.o, high: +k.h, low: +k.l, close: +k.c })
      }
      ws.onclose = () => {
        if (stopped) return
        timer = setTimeout(connect, Math.min(1000 * 2 ** attempt++, 15000))
      }
    }
    connect()

    return () => {
      stopped = true
      clearTimeout(timer)
      ws.close()
    }
  }, [symbol, interval])

  return { candles, last }
}