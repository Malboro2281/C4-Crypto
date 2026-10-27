import { useState } from 'react'
import { usePrices } from './usePrices'
import { useCandles } from './useCandles'
import Chart from './Chart'
import './App.css'

const cryptocurrencies = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "XRP", name: "XRP" },
];

// вне компонента, чтобы массив не создавался заново при каждом рендере
const symbols = cryptocurrencies.map((c) => c.symbol)
const intervals = ["1m", "5m", "15m", "1h", "4h", "1d"]

function formatPrice(price) {
  if (price === undefined) return "..."
  return "$" + price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 10 ? 4 : 2,
  })
}

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptocurrencies[0]);
  const [balance, setBalance] = useState(10000);
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("1m");

  const { prices, status } = usePrices(symbols)
  const currentPrice = prices[selectedCrypto.symbol]
  const { candles, last } = useCandles(selectedCrypto.symbol, interval)

  return (
    <div className="app">
      <header className="header">
        <div className="logo">CryptoTrade</div>

        <div className="balance">
          <span>Balance · {status}</span>
          <strong>${balance.toFixed(2)}</strong>
        </div>
      </header>

      <main className="dashboard">
        <aside className="crypto-sidebar">
          <h2>Markets</h2>

          <div className="crypto-list">
            {cryptocurrencies.map((crypto) => (
              <button
                key={crypto.symbol}
                className={`crypto-item ${
                  selectedCrypto.symbol === crypto.symbol ? "active" : ""
                }`}
                onClick={() => setSelectedCrypto(crypto)}
              >
                <div>
                  <strong>{crypto.symbol}/USDT</strong>
                  <span>{crypto.name}</span>
                </div>

                <strong>{formatPrice(prices[crypto.symbol])}</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className="main-content">
          <div className="crypto-header">
            <div>
              <h1>{selectedCrypto.symbol}/USDT</h1>
              <p>{selectedCrypto.name}</p>
            </div>

            <div className="current-price">{formatPrice(currentPrice)}</div>
          </div>

          <div className="chart-panel">
            <div className="intervals">
              {intervals.map((i) => (
                <button
                  key={i}
                  className={i === interval ? "active" : ""}
                  onClick={() => setInterval(i)}
                >
                  {i}
                </button>
              ))}
            </div>
            <Chart candles={candles} last={last} />
          </div>

          <div className="trading-panel">
            <h2>Open Position</h2>

            <label htmlFor="amount">Amount (USDT)</label>

            <input
              id="amount"
              type="number"
              min="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="trade-buttons">
              <button className="long-button">LONG</button>
              <button className="short-button">SHORT</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;