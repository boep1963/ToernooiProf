//Aangepast 25-01-2026

function mouseIn(event) {
  var image = event.target; // Gebruik event.target in plaats van event.srcElement
  image.style.border = "2px solid #FFF"; // Stel zowel breedte, stijl en kleur in
}

function mouseOut(event) {
  var image = event.target;
  image.style.border = "0"; // Reset de border
}

function mouseInBut(event) {
  var button = event.target || event.srcElement;
  button.style.borderColor = "#FFF";
}
function mouseOutBut(event) {
  var button = event.target || event.srcElement;
  button.style.borderColor = "transparent";
}

// Maak de meta-tag aan
var meta = document.createElement('meta');
meta.name = "google";
meta.content = "notranslate";

// Voeg de tag toe aan de <head>
document.getElementsByTagName('head')[0].appendChild(meta);

// Optioneel: Forceer ook het 'translate' attribuut op de <html> tag
document.documentElement.setAttribute('translate', 'no');
