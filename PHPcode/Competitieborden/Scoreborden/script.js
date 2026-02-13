document.addEventListener("DOMContentLoaded", function () {
  // Zoek de knoppen en de tekstvelden waar de scores worden weergegeven
  var increaseScoreButtonA = document.getElementById("increaseScoreA"); //plusknop speler A
  var increaseScoreButtonB = document.getElementById("increaseScoreB"); //plusknop speler B
  var decreaseScoreButtonA = document.getElementById("decreaseScoreA"); //minknop speler A
  var decreaseScoreButtonB = document.getElementById("decreaseScoreB"); //minknop speler B

  var scoreATextField = document.getElementById("scoreA"); //huidige serie A
  var scoreBTextField = document.getElementById("scoreB"); //huidige serie B

  //toegevoegd 28-04-2024
  var restATextField = document.getElementById("ennog5A"); //en nog .. in <div id="restA"
  var restBTextField = document.getElementById("ennog5B"); //en nog .. in <div id="restB"

  // Voeg een klikgebeurtenis toe aan de knop voor speler A
  //roept functie op om huisige serie te verhogen
  //roept functie op om en nog .. te verlagen
  if (increaseScoreButtonA) {
    increaseScoreButtonA.addEventListener("click", function () {
      increaseScore(scoreATextField, maxScoreA);
      decreaseRest(restATextField);
    });
  }

  // Voeg een klikgebeurtenis toe aan de knop voor speler B
  if (increaseScoreButtonB) {
    increaseScoreButtonB.addEventListener("click", function () {
      increaseScore(scoreBTextField, maxScoreB);
      decreaseRest(restBTextField);
    });
  }

  // Voeg een klikgebeurtenis toe aan de knop voor het verlagen van de score van speler A
  if (decreaseScoreButtonA) {
    decreaseScoreButtonA.addEventListener("click", function () {
      increaseRest(restATextField, scoreATextField); //bij serie = 0 stoppen met verhogen
      decreaseScore(scoreATextField); //bij verlagen is doorgeven Maxscore niet nodig
    });
  }

  // Voeg een klikgebeurtenis toe aan de knop voor het verlagen van de score van speler B
  if (decreaseScoreButtonB) {
    decreaseScoreButtonB.addEventListener("click", function () {
      increaseRest(restBTextField, scoreBTextField);
      decreaseScore(scoreBTextField);
    });
  }

  // Functie om score te verhogen
  function increaseScore(scoreTextField, maxScore) {
    var currentScore = parseInt(scoreTextField.value);
    // Controleer of de score niet hoger wordt dan het maximale aantal caramboles
    if (currentScore < maxScore) {
      var newScore = currentScore + 1;
      scoreTextField.value = newScore;
    }
  }

  // Functie om score te verlagen
  function decreaseScore(scoreTextField) {
    var currentScore = parseInt(scoreTextField.value);
    // Controleer of de score niet lager wordt dan 0
    if (currentScore > 0) {
      var newScore = currentScore - 1;
      scoreTextField.value = newScore;
    }
  }

  // Functie om rest te verlagen
  function decreaseRest(tekst_veld) {
    var currentRest = parseInt(tekst_veld.value);
    if (!isNaN(currentRest) && currentRest != 0) {
      // Controleer of currentRest een geldige waarde heeft en niet al op 0 staat
      var newRest = currentRest - 1;
      tekst_veld.value = newRest;
    }
    //aangepast
    if (currentRest == 6) {
      if (tekst_veld == restATextField) {
        toggle("rest_A");
      } else {
        toggle("rest_B");
      }
    }
  }

  // Functie om rest te verhogen
  function increaseRest(tekst_veld, serie) {
    var currentRest = parseInt(tekst_veld.value);
    if (!isNaN(currentRest) && serie.value > 0) {
      var newRest = currentRest + 1;
      tekst_veld.value = newRest;
    }
    //aangepast
    if (currentRest == 5 && serie.value != 0) {
      if (tekst_veld == restATextField) {
        toggle("rest_A");
      } else {
        toggle("rest_B");
      }
    }
  }

  //functie om ennog5 aan of uit te zetten, wordt gekoppeld aan de Plus- en Min knoppen dus increaseRest en decreaseRest
  //de twee objecten zijn rest_A en rest_B
  //het betreft restATextField en restBTextField, te weten de aantallen nog te maken
  //als de waarde < 6 dan zichtbaar maken, anders onzichtbaar maken
  function toggle(obj) {
    var obj = document.getElementById(obj);
    if (obj.style.display == "block") obj.style.display = "none";
    else obj.style.display = "block";
  }
});
