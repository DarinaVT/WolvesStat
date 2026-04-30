let lastData = null;
let lastScroll = 0;
const nav = document.querySelector("nav");
const logoText = document.getElementById("logoText");
const navHeight = nav.offsetHeight;


async function loadData() {
    try {
        const res = await fetch("/api/ranked/season");
        const data = await res.json();
        if (JSON.stringify(data) === JSON.stringify(lastData)) return;
        lastData = data;
        render(data);
    }
    catch (err) {
        console.error(err);
        showError();
    }
}

function showLoading() {
    document.getElementById("app").innerHTML = `
        <div class="card">
            <div class="skeleton" style="width: 200px;"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
        </div>
    `;
}

function showError() {
    document.getElementById("app").innerHTML =
        "<div class='card'>Error loading data</div>";
}

function formatDate(date) {
    return new Date(date).toDateString();
}

function getTopClass(rank) {
    if (rank === 1) return "top1";
    if (rank === 2) return "top2";
    if (rank === 3) return "top3";
    return "";
}

function createAwardRow(a) {
    const tier = a.itemType?.toLowerCase() || "";
    const topClass = getTopClass(a.firstRank);
    const rankLabel = a.lastRank !== a.firstRank
        ? `#${a.firstRank} - ${a.lastRank}`
        : `#${a.firstRank}`;
    return `
        <tr class="${tier} ${topClass}">
        <td class="rank">${rankLabel}</td>
        <td><span class="tier-dot"></span>${a.itemType || ""}</td>
        <td class="gold-amount">${a.gold}</td>
        </tr>
    `;
}

function render(data) {
    data.seasonAwards.sort((a, b) => a.firstRank - b.firstRank);
    document.getElementById("app").innerHTML = `
        <div class="card">
        <div class="header">
            <div>
            <h2>Season ${data.season.number}</h2>
            <div>${formatDate(data.season.startTime)} - ${formatDate(data.season.endTime)}</div>
            </div>
            <div class="status ${data.season.finished ? "finished" : ""}">
            ${data.season.finished ? "Finished" : "Active"}
            </div>
        </div>

        <div class="stats">
            <div class="stat">
            <div class="stat-label">Start skill</div>
            <div class="stat-value">${data.startSkillDefault}</div>
            </div>
            <div class="stat">
            <div class="stat-label">Level 1</div>
            <div class="stat-value">${data.startSkillLevel1}</div>
            </div>
            <div class="stat">
            <div class="stat-label">Required</div>
            <div class="stat-value">${data.startSkillLevel1RequiredSkill}</div>
            </div>
        </div>

        <div class="section-title">Rewards</div>
        <table>
            <thead>
            <tr>
                <th>Rank</th>
                <th>Tier</th>
                <th>Gold</th>
            </tr>
            </thead>
            <tbody>
            ${data.seasonAwards.map(createAwardRow).join("")}
            </tbody>
        </table>

        <div class="section-title">Bonus gold</div>
        <div class="bonus">
            <div class="bonus-item">
                <div class="bonus-label">Village</div>
                <div class="bonus-value">+${data.goldPrizeWinAsVillage}</div>
            </div>
            <div class="bonus-item">
                <div class="bonus-label">Werewolf</div>
                <div class="bonus-value">+${data.goldPrizeWinAsWerewolf}</div>
            </div>
            <div class="bonus-item">
                <div class="bonus-label">Voting</div>
                <div class="bonus-value">+${data.goldPrizeWinAsVoting}</div>
            </div>
            <div class="bonus-item">
                <div class="bonus-label">Solo</div>
                <div class="bonus-value">+${data.goldPrizeWinAsSolo}</div>
            </div>
        </div>
        </div>
    `;
}


window.addEventListener("scroll", () => {
    const current = window.scrollY;

    if (current > lastScroll && current > 60) {
        nav.style.transform = "translateY(-100%)";
    } else {
        nav.style.transform = "translateY(0)";
    }

    const logoBottom = logoText.getBoundingClientRect().bottom;
    const cardTop = document.getElementById("app").getBoundingClientRect().top;

    if (cardTop < logoBottom) {
        const overlap = logoBottom - cardTop;
        logoText.style.clipPath = `inset(0 0 ${overlap}px 0)`;
    } else {
        logoText.style.clipPath = "none";
    }

    lastScroll = current;
});

showLoading();
setInterval(loadData, 30000);
loadData();