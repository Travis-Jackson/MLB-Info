// select parent div
const teamDiv = document.getElementById("teams");
// select input
const season = document.getElementById("season");
// select button div
const buttonDiv = document.getElementById("buttons");
// create two buttons
const button = document.createElement("button");
button.setAttribute("class", "main-btn");
const reset = document.createElement("button");
reset.setAttribute("class", "main-btn");
// button labels
button.innerText = "Get Teams";
reset.innerText = "Reset";
// appending the buttons to the buttonDiv
buttonDiv.appendChild(button);
buttonDiv.appendChild(reset);

// intializing an empty search history array
const history = [];

// history heading
const historyHeading = document.createElement("h3");
historyHeading.innerText = "Search History:";
buttonDiv.appendChild(historyHeading);
// history paragraph
const historyPara = document.createElement("p");
buttonDiv.appendChild(historyPara);

button.addEventListener("click", () => {
  // checking if input value is empty
  if (season.value === "") {
    alert("Please Enter Valid Year");
  }
  // intializing empty variables
  let yearPre;
  let year;
  // check if history[] is empty
  if (history.length !== 0) {
    // isolate year
    yearPre = history[history.length - 1].split(">")[1];
    year = yearPre.split("<")[0];
  }
  // check if the same year is being searched repeatedly,
  // or if there are team divs on the screen
  if (
    year !== season.value ||
    document.getElementsByClassName("team").length === 0 ||
    season.value == ""
  ) {

    if (!isNaN(Number(season.value)) && Number(season.value) >= 1876 && Number(season.value) <= new Date().getFullYear()) {
      // calls the api and displays the response as a list of divs
      getTeamData(showList, season.value);
    } else {
      season.value = "";
      alert("Please Enter a Valid Year");
    }

    // add to search history
    // checking the last item in history to prevent consecutive repeats
    if (history[history.length - 1] !== `<a href="#">${season.value}</a>` && season.value !== ""
      && !isNaN(Number(season.value))) {
      // if not repeated, push item as an anchor tag
      history.push(`<a href="#">${season.value}</a>`);
      // displaying the links in history[]
      historyPara.innerHTML = history;
    }
    // selecting all the anchor tags and assigning a variable
    const aTags = document.getElementsByTagName("a");
    for (let i = 0; i < aTags.length; i++) {
      // adding event listener to each anchor tag
      aTags[i].addEventListener("click", () => {
        // isolating the year
        const yearPre = history[i].split(">")[1];
        const year = yearPre.split("<")[0];
        // assigning the value of the input to the year variable
        season.value = year;
        // click "Get Teams" button to make api request
        button.click();
      });
    }
  }
});
// click event to remove each of the teamDivs
reset.addEventListener("click", () => {
  while (teamDiv.hasChildNodes()) {
    teamDiv.removeChild(teamDiv.firstChild);
  }
});
// add event listener to press "Get Teams"
// button when the user presses enter
season.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    button.click();
  }
})

// creates elements and displays them
function showList(array) {

  for (let i = 0; i < array.length; i++) {
    const teamDataDiv = document.createElement("div");

    teamDataDiv.setAttribute("class", "team");
    teamDataDiv.setAttribute("id", "MLB-" + array[i]["team_id"]);
    teamDiv.appendChild(teamDataDiv);

    const teamName = document.createElement("h4");
    teamName.setAttribute("class", "team-name");
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

    // creating a showRosterButton
    const showRosterButton = document.createElement("button");
    showRosterButton.setAttribute("class", "roster-btn");
    showRosterButton.setAttribute("id", "btn-" + array[i]["team_id"]);
    showRosterButton.innerText = "Show Roster";
    teamDataDiv.appendChild(showRosterButton);

    // add EventListener to each new div
    showRosterButton.addEventListener("click", () => {
      // isolating teamId from the teamDataDiv.id
      const teamId = teamDataDiv.id.split("-")[1];

      showRosterButton.disabled = true;

      // prevent the same team roster being displayed more than once
      if (document.getElementById(teamDataDiv.id + "-table") !== null) {
        return;
      }
      // calls the api and displays the response as a table 
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
  // if results[] is not empty click reset to clear the screen
  if (results.length > 0) {
    reset.click();
  }
  // display results on the screen
  func(results);
}
// displaying roster as a table
function showRoster(array, divId) {
  // selecting the parentDiv aka teamDiv
  const parentDiv = document.getElementById(divId);

  // created a div to place button inside of for css styling
  const hbDiv = document.createElement("div");
  hbDiv.setAttribute("class", "hide");
  parentDiv.appendChild(hbDiv);

  // create table
  const rosterTable = document.createElement("table");
  // providing an id for each table
  rosterTable.setAttribute("id", divId + "-table");

  // append the rosterTable to it's parent div
  parentDiv.appendChild(rosterTable);

  // created button to remove the roster table
  const hideTableButton = document.createElement("button");
  hideTableButton.setAttribute("class", "hideBtn");
  hideTableButton.innerText = "Hide Table";
  hbDiv.appendChild(hideTableButton);

  // removing the elements inside of the table
  hideTableButton.addEventListener("click", () => {
    while (rosterTable.hasChildNodes()) {
      rosterTable.removeChild(rosterTable.firstChild);
    }
    // removing the table
    rosterTable.remove();
    hideTableButton.remove();

    // re-enabling the disabled button 
    document.getElementById("btn-" + divId.split("-")[1]).disabled = false;
  });
  // creating table elements and assigning the data
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

  // creating individual row of players
  for (let i = 0; i < array.length; i++) {
    const playerRow = document.createElement("tr");
    rosterTable.appendChild(playerRow);

    const numberTd = document.createElement("td");
    numberTd.innerText = array[i]["jersey_number"];

    const nameTd = document.createElement("td");
    nameTd.innerText = array[i]["name_first_last"];

    const positionTd = document.createElement("td");
    positionTd.innerText = array[i]["position_desig"].charAt(0) + array[i]["position_desig"].substring(1).toLowerCase();

    const buttonTd = document.createElement("td");
    const icon = document.createElement("i");
    icon.setAttribute("class", "fa-solid fa-info")
    buttonTd.appendChild(icon);
    // select the button that opens modal
    const playerInfoButton = document.getElementById("modal-btn");
    // add event listener to the icon to open the modal
    icon.addEventListener("click", () => {
      getPlayerInfo(array[i]["player_id"]);
      playerInfoButton.click();
    })

    playerRow.appendChild(numberTd);
    playerRow.appendChild(nameTd);
    playerRow.appendChild(positionTd);
    playerRow.appendChild(buttonTd);
  }
}
// make an AJAX request to the api, then display roster by calling showRoster
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

// make an AJAX call and create a paragraph filled with player info, then display in modal
async function getPlayerInfo(playerId) {

  const url = `https://lookup-service-prod.mlb.com/json/named.player_info.bam?sport_code='mlb'&player_id=${playerId}`
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();
  const player = data["player_info"]["queryResults"]["row"];

  console.log(player);

  // select modal body
  const modalBody = document.getElementsByClassName("modal-body")[0];
  if (modalBody.hasChildNodes()) {
    modalBody.removeChild(modalBody.firstChild);
  }

  let playerNum = player["jersey_number"];
  if (playerNum !== "") {
    playerNum = "<span class= 'bold'>#" + playerNum + "</span>";
  }

  // set title to player name
  const playerName = document.getElementById("exampleModalLabel");
  playerName.innerHTML =
    player["name_display_first_last"] + "&emsp;&emsp;&emsp;" + playerNum;

  // create paragraph
  const paragraph = document.createElement("p");

  // use span tags to set css to bold
  paragraph.innerHTML =
    "<span class= 'bold'>Team: </span>" +
    player["team_name"] +
    "<br/><span class= 'bold'>Country:</span> " +
    player["birth_country"] +
    " <span class='bold'>Birth Date:</span> " +
    player["birth_date"].split("T")[0] +
    "<br/><span class= 'bold'>Throw:</span> " +
    player["throws"] +
    " <span class='bold'>Bats:</span> " +
    player["bats"] +
    "<br/><span class='bold'>Pro Debut:</span> " +
    player["pro_debut_date"].split("T")[0];

  modalBody.appendChild(paragraph);
}

