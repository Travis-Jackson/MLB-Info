// select parent div
const teamDiv = document.getElementById("teams");
const season = document.getElementById("season");
const buttonDiv = document.getElementById("buttons");
const button = document.createElement("button");
const reset = document.createElement("button");

button.innerText = "Get Teams";
reset.innerText = "Reset";

buttonDiv.appendChild(button);
buttonDiv.appendChild(reset);

button.addEventListener("click", () => {
    if (season.value === "") {
        alert("Please Enter Valid Year");
    }
    getTeamData(showList, season.value);
});

reset.addEventListener("click", () => {
    season.value = "";
    while (teamDiv.hasChildNodes()) {
        teamDiv.removeChild(teamDiv.firstChild);
    }
});

// creates elements and displays them
function showList(array) {
    for (let i = 0; i < array.length; i++) {
        const teamDataDiv = document.createElement("div");

        teamDataDiv.setAttribute("class", "team");
        teamDataDiv.setAttribute("id", "MLB-" + array[i]["team_id"]);
        teamDiv.appendChild(teamDataDiv);

        const teamName = document.createElement("h4");
        const teamVenue = document.createElement("p");
        const teamLeague = document.createElement("p");
        const teamFirstPlayed = document.createElement("p");
        const hrElem = document.createElement("hr");

        teamName.innerText = array[i]["name_display_full"];
        teamVenue.innerText = "Venue: " + array[i]["venue_name"];
        teamLeague.innerText = "League: " + array[i]["league"];
        teamFirstPlayed.innerText =
            "First Year Played: " + array[i]["first_year_of_play"];

        teamDataDiv.appendChild(teamName);
        teamDataDiv.appendChild(teamVenue);
        teamDataDiv.appendChild(teamLeague);
        teamDataDiv.appendChild(teamFirstPlayed);

        const showRosterButton = document.createElement("button");
        showRosterButton.innerText = "Show Roster";
        teamDataDiv.appendChild(showRosterButton);

        // add EventListener to each new div
        showRosterButton.addEventListener("click", () => {
            const teamId = teamDataDiv.id.split("-")[1];
            getRosterData(showRoster, season.value, teamId, teamDataDiv.id);
        });

        if (i !== array.length - 1) {
            teamDataDiv.appendChild(hrElem);
        }
    }
}

// Make AJAX call to the api, then calls showList
async function getTeamData(func, season) {
    const url = `https://lookup-service-prod.mlb.com/json/named.team_all_season.bam?sport_code='mlb'&all_star_sw='N'&sort_order=name_asc&season=${season}`;
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
    const results = data["team_all_season"]["queryResults"]["row"];
    console.log(results);

    if (results === undefined) {
        alert("Year Not Available");
    }

    if (results.length > 0) {
        reset.click();
    }

    func(results);
}

function showRoster(array, divId) {
    const rosterTable = document.createElement("table");
    const parentDiv = document.getElementById(divId);
    parentDiv.appendChild(rosterTable);

    const hbDiv = document.createElement("div");
    hbDiv.setAttribute("class", "hide");
    rosterTable.appendChild(hbDiv);

    const hideTableButton = document.createElement("button");
    hideTableButton.setAttribute("class", "hideBtn");
    hideTableButton.innerText = "Hide Table";
    hbDiv.appendChild(hideTableButton);

    hideTableButton.addEventListener("click", () => {
        while (rosterTable.hasChildNodes()) {
            rosterTable.removeChild(rosterTable.firstChild);
        }
    });

    const tableHeaderRow = document.createElement("tr");
    rosterTable.appendChild(tableHeaderRow);

    const numberHeader = document.createElement("th");
    numberHeader.innerText = "Number";
    const nameHeader = document.createElement("th");
    nameHeader.innerText = "Name";
    const positionHeader = document.createElement("th");
    positionHeader.innerText = "Position";

    tableHeaderRow.appendChild(numberHeader);
    tableHeaderRow.appendChild(nameHeader);
    tableHeaderRow.appendChild(positionHeader);

    for (let i = 0; i < array.length; i++) {
        const playerRow = document.createElement("tr");
        rosterTable.appendChild(playerRow);

        const numberTd = document.createElement("td");
        numberTd.innerText = array[i]["jersey_number"];
        const nameTd = document.createElement("td");
        nameTd.innerText = array[i]["name_first_last"];
        const positionTd = document.createElement("td");
        positionTd.innerText = array[i]["position_desig"];

        playerRow.appendChild(numberTd);
        playerRow.appendChild(nameTd);
        playerRow.appendChild(positionTd);
    }
}

async function getRosterData(func, season, teamId, divId) {
    const url = `https://lookup-service-prod.mlb.com/json/named.roster_team_alltime.bam?start_season=${season}&end_season=${season}&team_id=${teamId}`;
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
    const results = data["roster_team_alltime"]["queryResults"]["row"];
    console.log(results);

    if (results === undefined) {
        alert("Roster Not Available");
    }

    func(results, divId);
}
