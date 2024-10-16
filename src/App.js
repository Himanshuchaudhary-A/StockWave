import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import StockAlerts from "./Components/StockAlerts.tsx";
import Portfolio from "./Components/Chatbot.tsx";
import StockData from "./Components/StockData.tsx";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/livePrices" className="nav-button">
            Live Prices
          </Link>
          <Link to="/stockAlerts" className="nav-button">
            Set Alerts
          </Link>
          <Link to="/chatbot" className="nav-button">
            Chat Bot
          </Link>
        </nav>
        <Routes>
          <Route path="/livePrices" element={<StockData />} />
          <Route path="/stockAlerts" element={<StockAlerts />} />
          <Route path="/chatbot" element={<Portfolio />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
