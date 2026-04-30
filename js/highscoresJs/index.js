let currentScores = null;
let currentView = "all time";
let lastData = null;

async function loadData(){
    try{
        const res = await fetch("/api/players/highscores");
        const data = await res.json();

        if (lastData && JSON.stringify(data) === JSON.stringify(lastData)){
            return;
        }

        lastData = data;
        currentScores = data;

        renderView();
    }
    catch(err){
        console.log(err);
        showError("Error loading data");
    }
}

function renderView(){
    if(!currentScores) return;

    switch(currentView){
        case "all time":
            renderAllTime(currentScores);
            break;
        case "monthly":
            renderMonthly(currentScores);
            break;
        case "weekly":
            renderWeekly(currentScores);
            break;
        case "daily":
            renderDaily(currentScores);
            break;
    }
}

function createRow(member){
    return `
    <tr>
        <td>${member.username}</td>
        <td>${member.xp}</td>
        <td>${member.oldRank}</td>
    </tr>
    `;
}

function renderTable(dataArray){
    return `
        <div class="card">
            <div class="players">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>XP</th>
                            <th>Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataArray.map(createRow).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderAllTime(data){
    document.getElementById("app").innerHTML = renderTable(data.allTime);
}

function renderMonthly(data){
    document.getElementById("app").innerHTML = renderTable(data.monthly);
}

function renderWeekly(data){
    document.getElementById("app").innerHTML = renderTable(data.weekly);
}

function renderDaily(data){
    document.getElementById("app").innerHTML = renderTable(data.daily);
}

function showLoading() {
    document.getElementById("app").innerHTML = `
        <div class="load">
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

document.querySelectorAll(".item a").forEach(btn =>{
    btn.addEventListener("click", function(){
        document.querySelectorAll(".item a").forEach(b => b.classList.remove("active"));
        this.classList.add("active");

        showLoading();

        const view = this.textContent.trim().toLowerCase();
        currentView = view;

        renderView();
    });
});

showLoading();
loadData();
setInterval(loadData, 50000);