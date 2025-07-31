// /api/seasons.js
export default async function handler(req, res) {
  const { league } = req.query;

  if (!league) {
    return res.status(400).json({ error: "Missing league ID" });
  }

  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/leagues?id=${league}`,
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
      .json({ error: "Failed to fetch seasons", details: error.message });
  }
}
