import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

const API_KEY = import.meta.env.VITE_API_KEY;
const LEAGUE = 39; // Premier League

// 🔍 Search button
const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", async () => {
  const query = document.getElementById("search-input").value.trim();
  if (!query) return;

  await fetchPlayerData(query);
});

async function loadPlayersFromDB() {
  const { data, error } = await supabase.from("players").select("*");

  console.log("📦 Supabase data:", data);
  console.log("🐛 Supabase error:", error);

  if (error) {
    console.error("❌ Error loading players from DB:", error.message);
    return;
  }

  const container = document.querySelector(".player-container");
  container.innerHTML = "";

  const template = document.querySelector("#player-card-template");

  data.forEach((player) => {
    const card = template.content.cloneNode(true);

    card.querySelector(".player-name").textContent = player.name;
    card.querySelector(".player-season").textContent = `Season ${
      player.season
    }-${(parseInt(player.season) + 1).toString().slice(-2)}`;

    card.querySelector(".player-nationality").textContent = player.nationality;

    card.querySelector(".player-position").textContent = `Position: ${
      player.position || "N/A"
    }`;
    card.querySelector(".player-team").textContent = `Team: ${
      player.team || "Unknown"
    }`;
    card.querySelector(".player-goals").textContent = `Goals: ${
      player.goals ?? "N/A"
    }`;
    card.querySelector(".player-assists").textContent = `Assists: ${
      player.assists ?? "N/A"
    }`;
    card.querySelector(".player-photo").src = player.photo_url;
    card.querySelector(".player-photo").alt = `${player.name}'s photo`;

    card.querySelector(".player-minutes").textContent = `Minutes: ${
      player.minutes ?? "N/A"
    }`;
    card.querySelector(".player-appearances").textContent = `Games Played: ${
      player.appearances ?? "N/A"
    }`;
    card.querySelector(".player-rating").textContent = `Rating: ${
      player.rating ?? "N/A"
    }`;
    card.querySelector(".player-shots").textContent = `Shots: ${
      player.shots ?? "N/A"
    }`;
    card.querySelector(".player-passes").textContent = `Passes: ${
      player.passes ?? "N/A"
    }`;
    card.querySelector(".player-dribbles").textContent = `Dribbles: ${
      player.dribbles ?? "N/A"
    }`;
    card.querySelector(".player-duels").textContent = `Duels: ${
      player.duels ?? "N/A"
    }`;
    card.querySelector(".player-cards").textContent = `🟨 ${
      player.yellow_cards ?? 0
    }   🟥 ${player.red_cards ?? 0}`;

    const toggleBtn = card.querySelector(".toggle-stats-btn");
    const extraStats = card.querySelector(".player-extra-stats");

    if (toggleBtn && extraStats) {
      toggleBtn.addEventListener("click", () => {
        const isHidden = extraStats.classList.toggle("hidden");
        toggleBtn.textContent = isHidden ? "Show More" : "Hide";
      });
    }

    container.appendChild(card);
  });
}

async function fetchPlayerData(playerName) {
  const url = `https://v3.football.api-sports.io/players?search=${encodeURIComponent(
    playerName
  )}&season=${document.getElementById("season-select").value}&league=${LEAGUE}`;

  try {
    const response = await fetch(url, {
      headers: {
        "x-apisports-key": API_KEY,
      },
    });

    if (response.status === 429) {
      const container = document.querySelector(".player-container");
      container.innerHTML = `<p class="no-results">⚠️ API limit reached. Try again later.</p>`;
      return;
    }

    const data = await response.json();
    const players = data.response;

    const container = document.querySelector(".player-container");
    container.innerHTML = "";

    if (!players || players.length === 0) {
      container.innerHTML = `<p class="no-results">No players found. Try again or check your spelling. Or change the season</p>`;
      return;
    }

    const template = document.querySelector("#player-card-template");

    const season = document.getElementById("season-select").value;

    players.forEach(async (item) => {
      const player = item.player;
      const stats = item.statistics?.[0] || {};
      const card = template.content.cloneNode(true);

      card.querySelector(".player-name").textContent = player.name;
      card.querySelector(".player-season").textContent = `Season ${season}-${(
        parseInt(season) + 1
      )
        .toString()
        .slice(-2)}`;

      card.querySelector(".player-nationality").textContent =
        player.nationality;

      card.querySelector(".player-position").textContent = `Position: ${
        stats.games?.position || "N/A"
      }`;
      card.querySelector(".player-team").textContent = `Team: ${
        stats.team?.name || "Unknown"
      }`;
      card.querySelector(".player-goals").textContent = `Goals: ${
        stats.goals?.total ?? "N/A"
      }`;
      card.querySelector(".player-assists").textContent = `Assists: ${
        stats.goals?.assists ?? "N/A"
      }`;
      card.querySelector(".player-photo").src = player.photo;
      card.querySelector(".player-photo").alt = `${player.name}'s photo`;

      card.querySelector(".player-minutes").textContent = `Minutes: ${
        stats.games?.minutes ?? "N/A"
      }`;
      card.querySelector(".player-appearances").textContent = `Games Played: ${
        stats.games?.appearences ?? "N/A"
      }`;
      card.querySelector(".player-rating").textContent = `Rating: ${
        stats.games?.rating ?? "N/A"
      }`;
      card.querySelector(".player-shots").textContent = `Shots: ${
        stats.shots?.total ?? "N/A"
      }`;
      card.querySelector(".player-passes").textContent = `Passes: ${
        stats.passes?.total ?? "N/A"
      }`;
      card.querySelector(".player-dribbles").textContent = `Dribbles: ${
        stats.dribbles?.attempts ?? "N/A"
      }`;
      card.querySelector(".player-duels").textContent = `Duels: ${
        stats.duels?.total ?? "N/A"
      }`;
      card.querySelector(".player-cards").textContent = `🟨 ${
        stats.cards?.yellow ?? 0
      }   🟥 ${stats.cards?.red ?? 0}`;

      const toggleBtn = card.querySelector(".toggle-stats-btn");
      const extraStats = card.querySelector(".player-extra-stats");

      toggleBtn.addEventListener("click", () => {
        const isHidden = extraStats.classList.toggle("hidden");
        toggleBtn.textContent = isHidden ? "Show More" : "Hide";
      });

      // 📤 Save to Supabase
      // Waits for Supabase client to send an insert request to the "players" table
      // We're inserting one object representing the player's stats
      const { error } = await supabase.from("players").insert([
        {
          name: player.name,
          nationality: player.nationality,
          photo_url: player.photo,
          season: season,
          team: stats.team?.name || null,
          position: stats.games?.position || null,
          goals: stats.goals?.total ?? null,
          assists: stats.goals?.assists ?? null,
          minutes: stats.games?.minutes ?? null,
          appearances: stats.games?.appearences ?? null,
          rating: stats.games?.rating ?? null,
          shots: stats.shots?.total ?? null,
          passes: stats.passes?.total ?? null,
          dribbles: stats.dribbles?.attempts ?? null,
          duels: stats.duels?.total ?? null,
          yellow_cards: stats.cards?.yellow ?? 0,
          red_cards: stats.cards?.red ?? 0,
        },
      ]);

      if (error) {
        console.error("❌ Supabase insert error:", error.message);
      }

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching player data:", error);
    document.querySelector(".player-container").innerHTML =
      "<p>Error loading data.</p>";
  }
}

async function fetchAvailableSeasons() {
  const url = `https://v3.football.api-sports.io/leagues?id=${LEAGUE}`;

  try {
    const response = await fetch(url, {
      headers: {
        "x-apisports-key": API_KEY,
      },
    });

    const data = await response.json();
    const seasons = data.response[0]?.seasons;

    if (!seasons || seasons.length === 0) return;

    const filteredYears = seasons
      .map((s) => s.year)
      .filter((year) => year !== 2025)
      .reverse();

    renderSeasonDropdown(filteredYears);
  } catch (error) {
    console.error("Error fetching seasons:", error);
  }
}

function renderSeasonDropdown(seasonYears) {
  const select = document.createElement("select");
  select.id = "season-select";

  seasonYears.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = `Season ${year}-${(year + 1).toString().slice(-2)}`;
    select.appendChild(option);
  });

  const seasonContainer = document.getElementById("season-container");
  seasonContainer.appendChild(select);
}

// On load
loadPlayersFromDB(); // 👈 Show all players from DB first
fetchAvailableSeasons();
