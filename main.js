import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

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

  if (error) {
    console.error("❌ Error loading players from DB:", error.message);
    return;
  }

  const container = document.querySelector(".player-container");
  container.innerHTML = "";

  const template = document.querySelector("#player-card-template");

  const grouped = {};
  data.forEach((player) => {
    if (!grouped[player.player_id]) grouped[player.player_id] = [];
    grouped[player.player_id].push(player);
  });

  Object.keys(grouped).forEach((id) => {
    const playerSeasons = grouped[id].sort((a, b) => b.season - a.season);

    const cardWrapper = document.createElement("div");
    cardWrapper.classList.add("carousel-wrapper");

    const carousel = document.createElement("div");
    carousel.classList.add("player-carousel");
    let index = 0;

    playerSeasons.forEach((player, idx) => {
      const card = template.content.cloneNode(true);

      card.querySelector(".player-name").textContent = player.name;
      card.querySelector(".player-season").textContent = `Season ${
        player.season
      }-${(parseInt(player.season) + 1).toString().slice(-2)}`;
      card.querySelector(".player-nationality").textContent =
        player.nationality;
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

      const slide = document.createElement("div");
      slide.classList.add("carousel-slide");
      if (idx !== 0) slide.style.display = "none";
      slide.appendChild(card);
      carousel.appendChild(slide);
    });

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "<";
    const nextBtn = document.createElement("button");
    nextBtn.textContent = ">";

    prevBtn.addEventListener("click", () => switchSlide(-1));
    nextBtn.addEventListener("click", () => switchSlide(1));

    function switchSlide(dir) {
      const slides = carousel.querySelectorAll(".carousel-slide");
      slides[index].style.display = "none";
      index += dir;
      index = Math.max(0, Math.min(index, slides.length - 1));
      slides[index].style.display = "block";
      updateNavButtons(slides.length);
    }

    function updateNavButtons(totalSlides) {
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === totalSlides - 1;
      prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
      nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
      prevBtn.style.cursor = prevBtn.disabled ? "default" : "pointer";
      nextBtn.style.cursor = nextBtn.disabled ? "default" : "pointer";
    }

    updateNavButtons(playerSeasons.length);

    cardWrapper.appendChild(carousel);

    const buttonRow = document.createElement("div");
    buttonRow.classList.add("carousel-buttons");
    buttonRow.appendChild(prevBtn);
    buttonRow.appendChild(nextBtn);

    cardWrapper.appendChild(buttonRow);
    container.appendChild(cardWrapper);
  });
}

async function fetchPlayerData(playerName) {
  const season = document.getElementById("season-select").value;
  const url = `/api/player?playerName=${encodeURIComponent(
    playerName
  )}&season=${season}&league=${LEAGUE}`;

  try {
    const response = await fetch(url);

    if (response.status === 429) {
      document.querySelector(
        ".player-container"
      ).innerHTML = `<p class="no-results">⚠️ API limit reached. Try again later.</p>`;
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
          player_id: player.id,
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
  try {
    const response = await fetch(`/api/seasons?league=${LEAGUE}`);
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

const highlightVideo = "eFtSxgZbwu4";

const highlightSegments = [
  { start: 610, end: 640 }, // 10:10 - 10:40
  { start: 851, end: 881 }, // 14:11 - 14:41
  { start: 711, end: 736 }, // 11:51 - 12:16
  { start: 641, end: 660 }, // 10:41 - 11:00
];

function getRandomSegment() {
  const randomIndex = Math.floor(Math.random() * highlightSegments.length);
  return highlightSegments[randomIndex];
}

function updateVideoSource() {
  const segment = getRandomSegment();
  const iframe = document.querySelector(".video-container iframe");
  if (iframe) {
    const videoUrl = `https://www.youtube.com/embed/${highlightVideo}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${highlightVideo}&start=${segment.start}&end=${segment.end}`;
    iframe.src = videoUrl;
  }
}

const backToHomeBtn = document.getElementById("back-to-home");
backToHomeBtn.addEventListener("click", () => {
  window.location.reload();
});

// Disable scroll restoration so page always starts at top on refresh
history.scrollRestoration = "manual";

// On load
loadPlayersFromDB();
fetchAvailableSeasons();
updateVideoSource();
