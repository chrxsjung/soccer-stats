export default async function handler(req, res) {
  const { playerName, season, league } = req.query;

  if (!playerName || !season || !league) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/players?search=${playerName}&season=${season}&league=${league}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "API request failed", details: error.message });
  }
}

//Moved the API-Football fetch logic into Vercel serverless functions (/api/player.js and /api/seasons.js) to hide the API key from the frontend. This protects the key from being exposed in browser DevTools, prevents abuse or quota theft, and separates frontend UI logic from backend data-fetching logic. Now, the frontend calls /api/player or /api/seasons, and the backend securely fetches the data using process.env.API_FOOTBALL_KEY.
