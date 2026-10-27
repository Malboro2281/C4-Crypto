import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export default function Chart({ candles, last }) {
  const containerRef = useRef(null)
  const seriesRef = useRef(null)

  // создаём график один раз
  useEffect(() => {
    const chart = createChart(containerRef.current, {
      autoSize: true, // сам подстраивается под размер блока
      layout: { background: { color: '#12161c' }, textColor: '#9aa4b2' },
      grid: { vertLines: { color: '#1b212a' }, horzLines: { color: '#1b212a' } },
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: '#232a35' },
    })

    seriesRef.current = chart.addCandlestickSeries({
      upColor: '#2ebd85',
      downColor: '#f6465d',
      wickUpColor: '#2ebd85',
      wickDownColor: '#f6465d',
      borderVisible: false,
    })

    return () => chart.remove()
  }, [])

  // загрузилась история -> рисуем все свечи
  useEffect(() => {
    if (candles.length) seriesRef.current.setData(candles)
  }, [candles])

  // пришёл тик -> обновляем последнюю свечу (или добавляем новую)
  useEffect(() => {
    if (!last) return
    try { seriesRef.current.update(last) } catch { /* тик от старого потока */ }
  }, [last])

  return <div ref={containerRef} style={{ width: '100%', height: 420 }} />
}