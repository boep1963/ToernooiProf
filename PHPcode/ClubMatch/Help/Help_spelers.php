<?php
//© Hans Eekels, versie 16-04-2024
//Help bij uitslagen

$Copy = Date("Y");

//verder
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Help</title>
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <style type="text/css">
    body,
    td,
    th {
      font-family: Verdana;
      font-size: 14px;
      color: #FFF;
    }

    h1 {
      font-size: 24px;
    }

    h2 {
      font-size: 16px;
    }

    body {
      background-color: #000;
      margin-top: 0px;
      margin-right: auto;
      margin-bottom: 0px;
      margin-left: auto;
      width: 400px;
    }

    input[type=button] {
      height: 30px;
      width: 150px;
      background-color: #CCC;
      color: #000;
    }

    .klein {
      font-family: Verdana;
      font-size: 10px;
      color: #FFF;
    }

    .submit-button {
      border: 2px solid transparent;
      cursor: pointer;
    }

    .submit-button:hover {
      border-color: #FFF;
    }
  </style>
  <script type="text/javascript">
    function mouseIn(event) {
      var image = event.srcElement;
      image.border = '2';
      image.style.borderColor = "#FFF";
    }

    function mouseOut(event) {
      var image = event.srcElement;
      image.border = '0';
    }

    function mouseInBut(event) {
      var button = event.target || event.srcElement;
      button.style.borderColor = "#FFF";
    }

    function mouseOutBut(event) {
      var button = event.target || event.srcElement;
      button.style.borderColor = "transparent";
    }
  </script>
</head>

<body>
  <table width="400" border="0">
    <tr>
      <td width="400" height="31" align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij Spelers</h1>
      </td>
    </tr>
    <tr>
      <td height="250" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          <strong>Speler koppelen</strong><br>
          Als u een competitie hebt aangemaakt en hebt geopend, moet u als eerste spelers aan deze competitie toevoegen.<br>
          NB: Die spelers heeft u eerder in de module "Leden" aangemaakt.<br>
          U kunt zoveel spelers aan een competitie koppelen als u wilt (maar bij erg veel spelers wordt de matrix met gespeelde partijen wel wat onhandig).
          <br><br>
          <strong>Speler verwijderen</strong><br>
          Spelers die aan een competitie zijn gekoppeld, kunt u altijd weer verwijderen, maar dat heeft wel consequenties omdat alle partijen van die speler worden verwijderd en bij zijn tegenstanders ook !<br>
          Vaak is het dus verstandig om spelers niet te verwijderen totdat u een nieuwe competitie hebt aangemaakt.<br>
          NB: spelers die u uit een competitie verwijdert, blijven gewoon beschikbaar om later opnieuw of aan andere competities te koppelen.
          <br><br>
          <strong>Lijst met spelers</strong><br>
          Een simpele lijst met alle spelers die aan deze competitie zijn gekoppeld. Die lijst kunt u ook uitprinten.
        </div>
      </td>
    </tr>
    <tr>
      <td height="32" align="center" bgcolor="#009900">
        <input type="button" value="Sluit Help" onClick="self.close()">
      </td>
    </tr>
  </table>
</body>

</html>