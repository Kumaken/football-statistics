// Register Buttons:
// Search button event:
document.getElementById(`searchBtn`).addEventListener('click',function (){
    window.location.search = '?name=' + document.getElementById('search-field').value;
    searchAndDisplayTeam();
    return false;
});

// Display all team button event:
document.getElementById(`allTeamsBtn`).addEventListener('click',function (){
    getAndDisplayAllTeams();
    return false;
});
