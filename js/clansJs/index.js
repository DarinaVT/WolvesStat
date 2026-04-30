let currentClan = null;
let currentView = "clan";

const searchInput = document.getElementById("name");

searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        loadData();
    }
});

async function loadData() {
    const search = searchInput.value.trim();
    if (!search){
        return;
    }

    try {
        showLoading();

        const res = await fetch(`/api/clans/search?name=${encodeURIComponent(search)}&exactName=true`);
        const data = await res.json();

        if (!data || !data.length) {
            currentClan = null;
            showError("No information found");
            return;
        }

        currentClan = data[0];
        renderView();
    }
    catch (err) {
        console.error(err);
        showError("Error loading data");
    }
}

function renderView() {
    if (!currentClan){
        return;
    }
    switch (currentView) {
        case "clan":    
            renderClan(currentClan);  
            break;
        case "leader":  
            renderLeader(currentClan); 
            break;
        case "co-leaders":
            renderCoLeaders(currentClan);
            break;
        case "members": 
            renderMembers(currentClan);
            break;
    }
}

function renderClan(data) {
    document.getElementById("app").innerHTML = `
        <div class="card">
            <span id="clan-name">${data.name}</span>
            <div class="row">
                <span id="date">Created: ${formatDate(data.creationTime)}</span>
                <span id="join-type">Join type: ${clanJoinType(data.joinType)}</span>
            </div>
            <div class="clan-bio">
                <span>Clan bio</span>
                <p id="desc">${data.description || "No description"}</p>
            </div>
            <div class="clan">
                <div class="clan-item">
                    <div class="clan-label">Quests</div>
                    <div class="clan-value">${data.questHistoryCount}</div>
                </div>
                <div class="clan-item">
                    <div class="clan-label">Members</div>
                    <div class="clan-value">${data.memberCount}</div>
                </div>
                <div class="clan-item">
                    <div class="clan-label">Min level</div>
                    <div class="clan-value">${data.minLevel}</div>
                </div>
            </div>
        </div>
    `;
}

async function renderLeader(data) {
    try {
        const res = await fetch(`/api/players/${data.leaderId}`);
        const leaderData = await res.json();

        document.getElementById("app").innerHTML = `
            <div class="card">
                <div class="leader-data">
                    <img src="${leaderData.equippedAvatar.url}" id="leader-avatar">
                    <div class="leader">
                        <div class="leader-item">
                            <div class="leader-label">Username</div>
                            <div class="leader-value">${leaderData.username}</div>
                        </div>
                        <div class="leader-item">
                            <div class="leader-label">Level</div>
                            <div class="leader-value">${handleLevel(leaderData.level)}</div>
                        </div>
                        <div class="leader-item">
                            <div class="leader-label">Last Online</div>
                            <div class="leader-value">${formatDate(leaderData.lastOnline)}</div>
                        </div>
                    </div>
                    <div class="desc">
                        <span>Bio</span>
                        <div>${leaderData.personalMessage}</div>
                    </div>
                </div>
            </div>
        `;
    }
    catch (err) {
        showError("Failed to load leader");
    }
}

//mock data to see how the grid works
/*const fakeCoLeaders = Array.from({ length: 15 }, (_, i) => ({
    username: `TestUser_${i}`,
    xp: 10000 + i * 500,
    level: i % 2 === 0 ? 50 + i : -1,
    equippedAvatar: {
        url: "https://via.placeholder.com/60"
    }
}));*/

async function renderCoLeaders(clan) {
    try {
        showLoading();

        const res = await fetch(`/api/clans/${clan.id}/members`);
        const members = await res.json();
        const coLeaders = members.filter(m => m.isCoLeader);
        
        if (!coLeaders.length) {
            showError("No co-leaders found");
            return;
        }

        const playerPromises = coLeaders.map(m =>
            fetch(`/api/players/${m.playerId}`).then(r => r.json())
        );

        const players = await Promise.all(playerPromises);

        const merged = coLeaders.map((m, i) => ({
            username: m.username,
            xp: m.xp,
            level: m.level,
            avatar: players[i]?.equippedAvatar?.url
        }));

        document.getElementById("app").innerHTML = `
            <div class="card card-wide">
                <div class="coleaders-grid">
                    ${merged.map(p => `
                        <div class="coleader-card">
                            <img src="${p.avatar}" class="coleader-avatar">

                            <div class="coleader-info">
                                <div class="coleader-name">${p.username}</div>
                                <div class="coleader-xp">XP: ${p.xp}</div>
                                <div class="coleader-level">Level: ${handleLevel(p.level)}</div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    } 
    catch (err) {
        console.error(err);
        showError("Failed to load co-leaders");
    }
}


function createRow(member){
    return `
    <tr>
        <td>${member.username}</td>
        <td>${handleLevel(member.level)}</td>
        <td>${member.xp}</td>
    </tr>
    `;
}

async function renderMembers(clan) {
    try {
        showLoading();

        const res = await fetch(`/api/clans/${clan.id}/members`);
        const members = await res.json();

        document.getElementById("app").innerHTML = `
            <div class="card">
                <div class="members">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Level</th>
                                <th>XP</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${members.map(createRow).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } 
    catch (err) {
        console.error(err);
        showError("Failed to load members");
    }
}

//other functionalities
function handleLevel(level){
    if(level === -1){
        return "Hidden";
    }
    else{
        return level;
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

function showError(message = "Error loading data") {
    document.getElementById("app").innerHTML =
        `<div class='card' style="display:flex; align-items:center; justify-content: center;">${message}</div>`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function clanJoinType(joinType) {
    switch (joinType) {
        case "PUBLIC":          
            return "Anyone can join";
        case "PRIVATE":         
            return "Closed";
        case "JOIN_BY_REQUEST": 
            return "Invite only";
        default:                
            return "Unknown";
    }
}

document.querySelectorAll(".item a").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".item a").forEach(b => b.classList.remove("active"));
        this.classList.add("active");

        const view = this.textContent.trim().toLowerCase();
        if (view === "clan"){
            currentView = "clan";
        }
        else if (view === "leader"){
            currentView = "leader";
        }
        else if (view === "members"){
            currentView = "members";
        }
        else if (view === "co-leaders"){
            currentView = "co-leaders";
        }

        renderView();
    });
});