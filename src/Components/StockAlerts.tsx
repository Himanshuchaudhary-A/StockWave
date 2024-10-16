import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import connection from "../signalRService.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const stockSymbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];

const StockPriceAlert: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(stockSymbols[0]);
  const [threshold, setThreshold] = useState<string>("");
  const [currentPrices, setCurrentPrices] = useState<any>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isThresholdSet, setIsThresholdSet] = useState<boolean>(false);

  useEffect(() => {
    const startConnection = async () => {
      if (connection.state === signalR.HubConnectionState.Disconnected) {
        try {
          await connection.start();
          console.log("SignalR connected");

          // Listener for stock price updates
          connection.on("ReceiveStockUpdate", (stockSymbol, price) => {
            setCurrentPrices((prevPrices) => ({
              ...prevPrices,
              [stockSymbol]: price.toFixed(2),
            }));

            // Notify if the stock price goes below the threshold
            if (
              stockSymbol === selectedSymbol &&
              price < parseFloat(threshold)
            ) {
              notify(stockSymbol, price);
            }
          });
        } catch (error) {
          console.error("SignalR connection error: ", error);
          setConnectionError("Unable to connect to the stock price service.");
        }
      } else {
        console.log(
          "SignalR connection is already established or in another state."
        );
      }
    };

    const delayConnection = () => {
      const timer = setTimeout(() => {
        startConnection();
      }, 0);
      return () => clearTimeout(timer);
    };

    if (isThresholdSet) {
      delayConnection();
    }

    // Cleanup on component unmount
    return () => {
      const stopConnection = async () => {
        if (connection.state === signalR.HubConnectionState.Connected) {
          try {
            await connection.stop();
            console.log("SignalR disconnected");
          } catch (err) {
            console.error("Error while stopping connection: ", err);
          }
        }
      };

      connection.off("ReceiveStockUpdate");
      stopConnection();
    };
  }, [selectedSymbol, threshold, isThresholdSet]);

  const notify = (symbol: string, price: number) => {
    toast(`Alert! ${symbol} price dropped to Rs ${price}`);
  };

  const handleSetThreshold = () => {
    if (!threshold || isNaN(parseFloat(threshold))) {
      toast.error("Please enter a valid threshold price.");
      return;
    }
    setIsThresholdSet(true);
  };

  return (
    <div>
      <h2>Stock Price Alert</h2>
      {connectionError && <p style={{ color: "red" }}>{connectionError}</p>}
      <div>
        <label htmlFor="stock-select">Select Stock: </label>
        <select
          id="stock-select"
          value={selectedSymbol}
          onChange={(e) => {
            setSelectedSymbol(e.target.value);
            setThreshold("");
            setIsThresholdSet(false);
          }}
        >
          {stockSymbols.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Set Price Threshold"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
        <button onClick={handleSetThreshold}>Set Threshold Price</button>
      </div>
      <ToastContainer />
      <h3>Current Prices:</h3>
      <ul>
        {Object.keys(currentPrices).length === 0 ? (
          <li>No stock data available.</li>
        ) : (
          Object.keys(currentPrices).map((stockSymbol) => (
            <li key={stockSymbol} style={{ listStyle: "none" }}>
              {stockSymbol}: Rs {currentPrices?.[stockSymbol]}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default StockPriceAlert;
