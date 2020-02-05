var dbPromised = idb.open("football-statistics", 1, function(upgradeDb) {
  var teamsObjectStore = upgradeDb.createObjectStore("teams", {
    keyPath: "name"
  });

  var favTeamsObjectStore = upgradeDb.createObjectStore("favTeams", {
    keyPath: "name"
  });

  // param 1: indexName & property is usually the same
  teamsObjectStore.createIndex("name", "name", {
    unique: true
  });

  favTeamsObjectStore.createIndex("name", "name", {
    unique: true
  });
});

// Save teams data:
function saveTeamData(team) {
  dbPromised
  .then(function(db) {
    var tx = db.transaction("teams", "readwrite");
    var store = tx.objectStore("teams");
    //console.log(team);
    store.put(team); // put also updates vs. add
    return tx.complete;
  })
  .then(function() {
    console.log("Teams berhasil di simpan.");
  })
}

// Get team by teamname:
function getTeamByName(teamname) {
  console.log(teamname);
  return new Promise(function(resolve, reject) {
    dbPromised
    .then( async function(db) {
      var tx = db.transaction("teams", "readonly");
      var store = tx.objectStore("teams");

      return store.get(teamname.toLowerCase());
    })
    .then(function(team) {
      // console.log(team);
      resolve(team);
    });
  });
}

function getAllTeam() {
  return new Promise(function(resolve, reject) {
    dbPromised
      .then(function(db) {
        var tx = db.transaction("teams", "readonly");
        var store = tx.objectStore("teams");
        return store.getAll();
      })
      .then(function(teams) {
        resolve(teams);
      });
  });
}


function getAllFavouriteTeam() {
  return new Promise(function(resolve, reject) {
    dbPromised
      .then(function(db) {
        var tx = db.transaction("favTeams", "readonly");
        var store = tx.objectStore("favTeams");
        return store.getAll();
      })
      .then(function(teams) {
        resolve(teams);
      });
  });
}

function removeParam(key, sourceURL) {
  var rtn = sourceURL.split("?")[0],
      param,
      params_arr = [],
      queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
      params_arr = queryString.split("&");
      for (var i = params_arr.length - 1; i >= 0; i -= 1) {
          param = params_arr[i].split("=")[0];
          if (param === key) {
              params_arr.splice(i, 1);
          }
      }
      rtn = rtn + "?" + params_arr.join("&");
  }
  return rtn;
}

function saveFavouriteTeam(team) {
  document.getElementById("loadingCircle").style.display = "initial";
  dbPromised
    .then(function(db) {
      var tx = db.transaction("favTeams", "readwrite");
      var store = tx.objectStore("favTeams");
      console.log(team);
      return Promise.all([store.get(team.name), store, tx]);
    })
    .then(function(result){
      console.log(result[0]);
      console.log(result[1]);
      if(result[0])
        M.toast({html: "Team Already Favourited!"});
      else{
        result[1].put(team);
        M.toast({html: "Team Successfully Favourited!"});
        // because i don't trust urlsearchparams with # urls :(
        loadPage('teamDetails');
        return result[2].complete;
      }
    })
}

function deleteFavouriteTeam(team) {
  document.getElementById("loadingCircle").style.display = "initial";
  dbPromised
    .then(function(db) {
      var tx = db.transaction("favTeams", "readwrite");
      var store = tx.objectStore("favTeams");
      console.log(team);
      return Promise.all([store.get(team.name), store, tx]);
    })
    .then(function(result){
      console.log(result[0]);
      console.log(result[1]);
      if(!result[0])
        M.toast({html: "Team Already Deleted!"});
      else{
        result[1].delete(team.name);
        M.toast({html: "Team Successfully Deleted!"});
        // because i don't trust urlsearchparams with # urls :(
        window.location.search = removeParam('saved', window.location.search);
        loadPage('teamDetails');
        return result[2].complete;
      }
    })
}


function getAll() {
  return new Promise(function(resolve, reject) {
    dbPromised
      .then(function(db) {
        var tx = db.transaction("articles", "readonly");
        var store = tx.objectStore("articles");
        return store.getAll();
      })
      .then(function(articles) {
        resolve(articles);
      });
  });
}

function getAllByTitle(title) {
  dbPromised
    .then(function(db) {
      var tx = db.transaction("articles", "readonly");
      var store = tx.objectStore("articles");
      var titleIndex = store.index("post_title");
      var range = IDBKeyRange.bound(title, title + "\uffff");
      return titleIndex.getAll(range);
    })
    .then(function(articles) {
      console.log(articles);
    });
}

function getById(id) {
  return new Promise(function(resolve, reject) {
    dbPromised
      .then(function(db) {
        var tx = db.transaction("articles", "readonly");
        var store = tx.objectStore("articles");
        return store.get(id);
      })
      .then(function(article) {
        resolve(article);
      });
  });
}
