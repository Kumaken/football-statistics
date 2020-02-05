var base_url = "https://api.football-data.org/v2/";
const API_KEY = '49696bb9feb5487a8ea96a4581530cff';

// Blok kode yang akan di panggil jika fetch berhasil
function status(response) {
  document.getElementById("loadingCircle").style.display = "none";
  if (response.status !== 200) {
    console.log("Error : " + response.status);
    // Method reject() akan membuat blok catch terpanggil
    return Promise.reject(new Error(response.statusText));
  } else {
    // Mengubah suatu objek menjadi Promise agar bisa "di-then-kan"
    return Promise.resolve(response);
  }

}

// Blok kode untuk memparsing json menjadi array JavaScript
function json(response) {
  return response.json();
}

// Blok kode untuk meng-handle kesalahan di blok catch
function error(error) {
  // Parameter error berasal dari Promise.reject()
  console.log("Error : " + error);
}

function authorizedFetch(url) {
  document.getElementById("loadingCircle").style.display = "initial";
  return fetch(url, {
    headers: {
      'X-Auth-Token': API_KEY // avoids CORS
    }
  });
}

function getAndSaveTeams(){
  const url = `${base_url}teams`;

  // fetch from API:
  authorizedFetch(url)
    .then(status)
    .then(json)
    .then(function(data) {
      //console.log(data);
        data.teams.forEach(function(team) {
          team.name = team.name.toLowerCase();
          saveTeamData(team);
        });
    })
    .catch(error);
}

function getAndSaveTeam(id){
  const url = `${base_url}teams/${id}`;

  // fetch from API:
  return new Promise(function(resolve, reject) {
    authorizedFetch(url)
    .then(status)
    .then(json)
    .then(function(data) {
        //console.log(data);
        data.name = data.name.toLowerCase();
        saveTeamData(data);
        resolve(data);
    })
    .catch(error);
  });
}

function getAndDisplayAllTeams() {
  document.getElementById("grid-content").innerHTML = '';
  let table = document.getElementById("grid-table-content");
  if(table)
    table.innerHTML = '';
  console.log("grid-content & table resetted");

  getAllTeam().then(function(data) {
    data.forEach(function(team) {
      displayTeamSimplified(team);
    })

  })
}

function getAndDisplayAllFavouriteTeams(){
  let content = document.getElementById("grid-content");
  if(content)
    content.innerHTML = '';
  let table = document.getElementById("grid-table-content");
  if(table)
    table.innerHTML = '';
  console.log("grid-content & table resetted");


  getAllFavouriteTeam().then(function(data) {
    data.forEach(function(team) {
      displayTeamSimplified(team, true);
    })

  })
}

function updateQueryString(key, value){
  var searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);
  window.location.search = searchParams.toString();
}

function searchAndDisplayTeam(teamname) {
  // let urlParams = new URLSearchParams(window.location.search);
  // let teamname = urlParams.get('name');
  // console.log(new URL(window.location.href).hash.split('?'));
  // let teamname = new URLSearchParams(new URL(window.location.href).hash.split('?')[1]).get('name')
  //let teamname =  document.getElementById("search-field").value;
  console.log(teamname);

  getTeamByName(teamname).then(function(team) {
    //console.log(team);
    if(team == undefined){ // if not found, request it, save to db, and query to indexed db again
      let id = new URLSearchParams(new URL(window.location.href).hash.split('?')[1]).get('id')
      getAndSaveTeam(id).then(function(data) {
          console.log("team displayed after saving a new team data to DB");
          displayTeam(data);
      });
      // getTeamByName(name).then(function(team) {
      //     displayTeam(team);
      // });
      return;
    }
    // Menyusun komponen data team secara dinamis
    displayTeam(team);
  });
}

function displayTeamByNameOrID(name, id){
  getTeamByName(name).then(function(team) {
    //console.log(team);
    if(team == undefined){ // if not found, request it, save to db, and query to indexed db again
      getAndSaveTeam(id).then(function(data) {
          console.log("team displayed after saving a new team data to DB");
          displayTeam(data);
      });
      // getTeamByName(name).then(function(team) {
      //     displayTeam(team);
      // });
      return;
    }
    // Menyusun komponen data team secara dinamis
    console.log("team is already in DB");
    displayTeam(team);
    });
}

function displayTeamSimplified(data, favourite = false){
  let resultHTML = `
  <div class="card brown white-text team-entry">
    <a onclick="location.href='?name=${encodeURIComponent(data.name)}&id=${data.id}${favourite ? '&saved=true' : ''}#teamDetails'; loadPage('teamDetails'); return false;">
      <div class="row" style="height: 10vmax">
        <div class="col s4 offset-s2">
          <img class="teamImageM responsive-img" src="${ data.crestUrl}">
        </div>
        <div class="col s4 offset-s2 teamname">
          <h5 class="teamNameM">${data.name.toUpperCase()}</h5>
        </div>
      </div>
    </a>
  </div>`;

  document.getElementById("grid-content").innerHTML += resultHTML;
}


function getAndDisplayMatchesByTeamID(team_id){
  const url = `${base_url}teams/${team_id}/matches`;

  if ("caches" in window) {
    caches.match(url).then(function (response) {
      if (response) {
        response.json().then(function (data) {
          displayMatchesOfTeam(data);
        });
      }
    });
  }

  // fetch from API:
  authorizedFetch(url)
    .then(status)
    .then(json)
    .then(function(data) {
      displayMatchesOfTeam(data);
    })
    .catch(error);

}

function displayMatchesOfTeam(data){
  //console.log(data);

  function tableEntryTemplate(data){
    //console.log(data);
    return `
          <tr>
            <td>${data.competition.name}</td>
            <td>${data.season.startDate}</td>
            <td>${data.season.endDate}</td>
            <td>${data.status}</td>
            <td>${data.group}</td>
            <td>${data.homeTeam.name}</td>
            <td>${data.awayTeam.name}</td>
            <td>${data.score.winner}</td>
          </tr>
    `;
  }

  let resultHTML = `
  <h5 class="tableTitle">Matches Information</h5>

  <div class="row">
    <div class="lineDivider col s10 offset-s1">
      <hr>
    </div>
  </div>

  <div class="row">
    <div class="col s10 offset-s1 white-text">
      <table class="tableContents responsive-table centered striped">
        <thead>
          <tr>
              <th>Competition</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Group</th>
              <th>Home</th>
              <th>Away</th>
              <th>Winner</th>
          </tr>
        </thead>
        <tbody>
              ${
                // Map instead of forEach! Because forEach ignores the return value of its callback and never returns anything (thus, calling it results in undefined
                data.matches.map(function(match){
                  return tableEntryTemplate(match);
                }).join("")
                //tableEntryTemplate(data.matches[0])
              }
        </tbody>
      </table>
    </div>
  </div>`;

  document.getElementById("grid-table-content").innerHTML = resultHTML;
}

function displayTeam(data){
  console.log(data);
  let resultHTML = ``;

  // var isFromSaved = new URLSearchParams(new URL(window.location.href.split('?')[1])).get('saved');

  let isFromSaved = new URLSearchParams(window.location.search).get('saved');
  console.log(isFromSaved);

  if(isFromSaved){
    let btnDelete = document.getElementById("delete");
    btnDelete.style.visibility = 'visible';
  } else {
    let btnSave = document.getElementById("save");
    btnSave.style.visibility = 'visible';
  }

  if(data == undefined){
    resultHTML += `
    <h5 class="errorText"> Error in searching!!! </h5>
    <h6 style="errorTextLesser"> Possible causes may be but not limited to: Database hasn't been initialized because of no internet connection, Wrong team name query (team name has to be precise); e.g.: type in 'Arsenal FC' (case does not matter)</h6>
    `
    document.getElementById("grid-content").innerHTML = resultHTML;
    return;
  }
  var str = JSON.stringify(data).replace(/http:/g, 'https:');
  data = JSON.parse(str);

  resultHTML +=  `<h4 class="infoEntry">${data.name.toUpperCase()}  </h4>

  <div class="row">
    <div class="col s6 offset-s3 lineDividerS">
      <hr>
    </div>
  </div>

  <div class="row">
    <br>
  </div>

  <div class="row" style="color:white">
    <div class="col s6 m6">
      <img class="responsive-img teamImageL" src="${ data.crestUrl}">
    </div>
    <div class="col s6 m6">
      <div class="row">
        <div class="col s3 width:100%">
          <p class="entryTextB">Short Name</p>
        </div>
        <div class="col s3 width:100%">
        <p style=" text-align: center">${data.shortName}</p>
        </div>
      </div>

      <div class="row">
        <div class="col s3 width:100%">
        <p class="entryTextB">Area</p>
        </div>
        <div class="col s3 width:100%">
        <p class="entryText">${data.area.name}</p>
        </div>
      </div>

      <div class="row">
        <div class="col s3 width:100%">
          <p class="entryTextB">TLA</p>
        </div>
        <div class="col s3 width:100%">
          <p style=" text-align: center">${data.tla}</p>
        </div>
      </div>

      <div class="row">
        <div class="col s3 width:100%">
          <p class="entryTextB">Founded In</p>
        </div>
        <div class="col s3 width:100%">
          <p class="entryText">${data.founded}</p>
        </div>
      </div>
    </div>

    <div class="row">
      <br>
    </div>


    <h5 class="tableTitle">Contact Information  </h5>

    <div class="row">
      <div class="col s6 offset-s3 lineDividerS">
        <hr>
      </div>
    </div>

    <div class="row">
      <br>
    </div>

    <div class="row" style="color:white">
      <div class="row">
        <div class="col s3 offset-s3 width:100%">
          <p class="entryTextB">Website</p>
        </div>
        <div class="col s3 width:100%">
          <a href="${data.website}">
            <p style=" text-align: center">${data.website}</p>
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col s3 offset-s3 width:100%">
          <p class="entryTextB">Email</p>
        </div>
        <div class="col s3 width:100%">
          <p class="entryText">${data.email}</p>
        </div>
      </div>

      <div class="row">
        <div class="col s3 offset-s3 width:100%">
          <p class="entryTextB">Address</p>
        </div>
        <div class="col s3 width:100%">
          <p class="entryText">${data.address}</p>
        </div>
      </div>

      <div class="row">
        <div class="col s3 offset-s3 width:100%">
          <p class="entryTextB">Phone Contact</p>
        </div>
        <div class="col s3 width:100%">
          <p class="entryText">${data.phone}</p>
        </div>
      </div>

      <div class="row">
        <div class="col s3 offset-s3 width:100%">
          <p class="entryTextB">Venue</p>
        </div>
        <div class="col s3 width:100%">
          <p class="entryText">${data.venue}</p>
        </div>
      </div>
    </div>

    </div>
  </div>
  `;
  //console.log(resultHTML);
  document.getElementById("grid-content").innerHTML = resultHTML;

  // Also get matches data table:
  getAndDisplayMatchesByTeamID(data.id);

  if(isFromSaved){
     // Delete button prep:
    document.getElementById("delete").addEventListener("click", function(){deleteFavouriteTeam(data)}, false);
  } else{
    // Save button prep:
    document.getElementById("save").addEventListener("click", function(){saveFavouriteTeam(data)}, false);
  }

}


function getAndDisplayStandings(leagueID){
  const url = `${base_url}competitions/${leagueID}/standings`;

  if ("caches" in window) {
    caches.match(url).then(function (response) {
      if (response) {
        response.json().then(function (data) {
          displayStandings(data);
          console.log("displayed standings from cache");
          return;
        });
      }
    });
  }

  // fetch from API:
  authorizedFetch(url)
    .then(status)
    .then(json)
    .then(function(data) {
        displayStandings(data);
        console.log("displayed standings from server request");
    })
    .catch(error);
}

function displayStandings(data){
  // RESET:
  console.log("grid-content resetted");
  document.getElementById("grid-content").innerHTML = "";
  let resultHTML = ``;

  var str = JSON.stringify(data).replace(/http:/g, 'https:');
  data = JSON.parse(str);

  let header =  `<h4 style ="font-weight: bold; text-align: center;">${data.competition.name}  </h4>

  <h6 style="text-align: center;">Started: ${data.season.startDate}</h5>
  <h6 style="text-align: center;">Ended: ${data.season.endDate}</h5>
  `;

  data.standings[0].table.forEach(function(team){
    //console.log(team);
    resultHTML+= `
    <div class="row" style="font-size: 1vmax;" >
      <div class="col s1 offset-s1"><p class="entryText">${team.position}</p></div>
      <a id="team-link" onclick="location.href='?name=${encodeURIComponent(team.team.name.toLowerCase())}&id=${team.team.id}#teamDetails'; loadPage('teamDetails'); return false;">
        <div class="col s1"><img class="responsive-img teamImageM" src="${ team.team.crestUrl}"> <p class="entryText">${team.team.name}</p></div>
      </a>
      <div class="col s1"><p class=" entryText>${team.playedGames}</p></div>
      <div class="col s1"><p class=" entryText">${team.won}</p></div>
      <div class="col s1"><p class=" entryText">${team.draw}</p></div>
      <div class="col s1"><p class=" entryText">${team.lost}</p></div>
      <div class="col s1"><p class=" entryText">${team.goalsFor}</p></div>
      <div class="col s1"><p class=" entryText">${team.goalsAgainst}</p></div>
      <div class="col s1"><p class=" entryText">${team.goalDifference}</p></div>
      <div class="col s1"><p class=" entryText">${team.points}</p></div>
    </div>
  `;

    // function linkToTeamDetails(team){
    //   console.log(team);
    //   loadPage('teamDetails');
    //   displayTeamByNameOrID(team.team.name, team.team.id);
    // }
    // if you don't use anonymous function here, you are directly calling it!
    // document.getElementById("team-link").addEventListener ("click", function(){linkToTeamDetails(team)}, false);
  })
  document.getElementById("grid-content").innerHTML = resultHTML;
  document.getElementById("header").innerHTML = header;

}
