<?php
//© Hans Eekels, versie 26-03-2025
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
      width: 600px;
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
  <table width="600" border="0">
    <tr>
      <td align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij aanmaak partijen</h1>
      </td>
    </tr>
    <tr>
      <td height="250" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          <strong>Instructie</strong><br>
          U maakt hier een partij aan die u wilt tonen op een scorebord bij de biljarttafel. Op het scorebord bij de biljarttafel kunt u dan deze partij oproepen.<br>
          Aanmaken of weer verwijderen van een partij doet u met de knoppen in de matrix. Als de knop groen is, kunt u daar op klikken: de knop wordt dan geel en de partij is aangemaakt. Als de knop geel is, kunt u daar ook op klikken: de knop wordt dan weer groen en de partij die was aangemaakt, wordt verwijderd.
          NB: als de knop rood is, is die partij al begonnen op het scorebord en kunt u die partij hier niet verwijderen (dat kan wel via beheer uitslagen en dan de partij verwijderen).<br><br>
          <strong>Tafelnummers</strong><br>
          Per partij die u aanmaakt, moet u aangeven op welke tafel deze partij opgeroepen kan worden. Dat kan op 1 specifieke tafel (klik dan bovenin op de check-box dat nummer aan) of de partij kan op meerdere tafels opgeroepen worden (klik dan op de check-box bij alle tafels die u wilt).<br><br>
          <strong>Bediening scorebord</strong><br>
          Als u Scoreborden gebruikt (zie de handleiding), dan kunnen die op 2 manieren bediend worden. Standaard staat ingesteld dat de scoreborden worden bediend met de bijbehorende draadloze muis. Een andere manier is dat u voor de bediening van het scorebord een aparte tablet of gewoon een smartphone gebruikt. In de handleiding staat uitgebreid beschreven hoe dat werkt. Van belang is dat u in uw beheersscherm, met de knop "Wijzig bediening scoreborden" per tafel kunt aangeven of het bijbehorende scorebord bediend moet worden met de muis of met behulp van een tablet/smartphone.
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