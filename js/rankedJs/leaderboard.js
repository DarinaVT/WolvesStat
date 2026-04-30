let lastData = null;
let lastScroll = 0;

const nav = document.querySelector("nav");
const logoText = document.getElementById("logoText");
const playerCache = new Map();

async function loadData() {
    try {
        const res = await fetch("/api/ranked/leaderboard");
        const data = await res.json();
        if (lastData && JSON.stringify(data) === JSON.stringify(lastData)){
            return;
        }
        
        lastData = data;

        render(data);
        loadTopAvatars(data.ranksTop.slice(0, 3));

    } catch (err) {
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

function createRow(player) {
    return `
        <tr>
            <td>${player.username}</td>
            <td>${player.skill}</td>
        </tr>
    `;
}

function topPlayers(top) {
    return `
    <div class="top">
        <div class="second">
            <img id="avatar-1" src="" />
            <span>${top[1]?.username || "-"}</span>
            <span>${top[1]?.skill || "-"}</span>
        </div>

        <div class="first">
            <img id="avatar-0" src="" />
            <span>${top[0]?.username || "-"}</span>
            <span>${top[0]?.skill || "-"}</span>
        </div>

        <div class="third">
            <img id="avatar-2" src="" />
            <span>${top[2]?.username || "-"}</span>
            <span>${top[2]?.skill || "-"}</span>
        </div>
    </div>
    `;
}

function render(data) {
    const topThree = data.ranksTop.slice(0, 3);
    const rest = data.ranksTop.slice(3);

    document.getElementById("app").innerHTML = `
        ${topPlayers(topThree)}
        <div class="rest">
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Skill</th>
                    </tr>
                </thead>
                <tbody>
                    ${rest.map(createRow).join("")}
                </tbody>
            </table>
        </div>
    `;
}

async function loadTopAvatars(topThree) {
    await Promise.all(
        topThree.map(async (player, index) => {
            try {
                let fullPlayer;
                if (playerCache.has(player.playerId)) {
                    fullPlayer = playerCache.get(player.playerId);
                }
                else {
                    const res = await fetch(`/api/players/${player.playerId}`);
                    fullPlayer = await res.json();
                    playerCache.set(player.playerId, fullPlayer);
                }
                updateAvatar(index, fullPlayer);

            }
            catch (err) {
                console.error("Avatar load failed:", err);
            }
        })
    );
}


function updateAvatar(index, player) {
    const img = document.getElementById(`avatar-${index}`);
    if (!img) return;
    img.src = player.equippedAvatar?.url || "";
    img.onload = () => {
        img.classList.add("loaded");
    };
}


window.addEventListener("scroll", () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 60) {
        nav.style.transform = "translateY(-100%)";
    }
    else {
        nav.style.transform = "translateY(0)";
    }

    const logoBottom = logoText.getBoundingClientRect().bottom;
    const appTop = document.getElementById("app").getBoundingClientRect().top;

    if (appTop < logoBottom) {
        const overlap = logoBottom - appTop;
        logoText.style.clipPath = `inset(0 0 ${overlap}px 0)`;
    }
    else {
        logoText.style.clipPath = "none";
    }

    lastScroll = current;
});


showLoading();
loadData();
setInterval(loadData, 500000);