document.addEventListener("DOMContentLoaded", function() {
  // Activate sidebar nav
  var elems = document.querySelectorAll(".sidenav");
  M.Sidenav.init(elems);
  loadNav();

  function loadNav() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status != 200) return;

        // Muat daftar tautan menu
        document.querySelectorAll(".topnav, .sidenav").forEach(function(elm) {
          elm.innerHTML = xhttp.responseText;
        });

        // Daftarkan event listener untuk setiap tautan menu
        document
          .querySelectorAll(".sidenav a, .topnav a")
          .forEach(function(elm) {
            elm.addEventListener("click", function(event) {
              // Tutup sidenav
              var sidenav = document.querySelector(".sidenav");
              M.Sidenav.getInstance(sidenav).close();

              // Muat konten halaman yang dipanggil
              page = event.target.getAttribute("href").substr(1);
              //console.log(page);
              page = page.split('?')[0] // get only page
              //console.log(page);
              loadPage(page);
            });
          });
      }
    };
    xhttp.open("GET", "nav.html", true);
    xhttp.send();
  }

  // Load page content
  var page = window.location.hash.substr(1);
  //console.log(page);
  page = page.split('?')[0]; // get only pure url
  if (page == "") page = "standings";
  loadPage(page);
});

// global func:
function loadPage(page) {
  // Load page content
  //console.log(page);
  // fetch('pages/' + page + '.html')
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      var content = document.querySelector("#body-content");
      // change current page title on navbar
      document.querySelector("#logo-container").innerHTML = "Football Statistics - " + page.charAt(0).toUpperCase() + page.slice(1);

      if (page === "about") {
        // do nothing for now
      } else if (page === "standings") {
        getAndDisplayStandings(2001);
      } else if (page === "teamDetails") {
        getAndSaveTeams();

        let teamname = new URLSearchParams(new URL(window.location.href).hash.split('?')[1]).get('name')
        console.log(teamname);
        if (teamname)
          searchAndDisplayTeam()

        // var urlParams = new URLSearchParams(window.location.search);
        // var isFromSaved = urlParams.get("saved");

      } else if (page === "favouriteTeams") {
        // get favourite team details:
        getAndDisplayAllFavouriteTeams();
      }

      if (this.status == 200) {
        content.innerHTML = xhttp.responseText;
      } else if (this.status == 404) {
        content.innerHTML = "<p>Halaman tidak ditemukan.</p>";
      } else {
        content.innerHTML = "<p>Ups.. halaman tidak dapat diakses.</p>";
      }
    }
  };
  xhttp.open("GET", "pages/" + page + ".html", true);
  xhttp.send();
}