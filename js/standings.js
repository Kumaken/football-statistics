// HELPER FUNCTIONS: update page asynchronously

function updateStandings(leagueID){
    getAndDisplayStandings(leagueID);
}

// Register Buttons:
// JS object as associative arrays of leagues. add here if you want to add more choice buttons for leagues!
let leagues = {"champion":2001, "premier":2021, "german":2002, "dutch":2003, "spain":2014, "french":2015};

Object.keys(leagues).forEach(function(key){
    document.getElementById(`${key}Btn`).addEventListener('click',function (){
        getAndDisplayStandings(leagues[key]);
        return false;
    });
});
