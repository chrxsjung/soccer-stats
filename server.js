// server.js

// 🔐 Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

// ⚙️ Import required modules
import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // Used to make HTTP requests to external API

// 🚀 Initialize Express app
const app = express();
app.use(cors()); // Allow requests from different origins (e.g., Vite frontend)

// 🔑 Load API key from environment
const API_KEY = process.env.VITE_API_KEY;
console.log("🧪 Final check — API Key:", API_KEY); // Debug: log the loaded key

// 🌍 Base URL for API-Football v3
const BASE_URL = "https://v3.football.api-sports.io";

// 📡 Endpoint: /api/player
// Forwards player search requests from frontend to the API-Football /players endpoint
app.get("/api/player", async (req, res) => {
  const { playerName, season, league } = req.query;

  try {
    const response = await fetch(
      `${BASE_URL}/players?search=${playerName}&season=${season}&league=${league}`,
      {
        headers: {
          "x-apisports-key": API_KEY, // Auth header
        },
      }
    );
    const data = await response.json();
    res.json(data); // Send API response back to frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch player data" });
  }
});

// 📡 Endpoint: /api/seasons
// Forwards league info requests to API-Football /leagues endpoint
app.get("/api/seasons", async (req, res) => {
  const { league } = req.query;

  try {
    const response = await fetch(`${BASE_URL}/leagues?id=${league}`, {
      headers: {
        "x-apisports-key": API_KEY,
      },
    });
    const data = await response.json();
    res.json(data); // Return the list of seasons
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch seasons" });
  }
});

// 🔊 Start the Express server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ API server running at http://localhost:${PORT}`);
});
