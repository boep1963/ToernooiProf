<?php
//© Hans Eekels, versie 21-04-2025
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
      width: 700px;
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
  <table width="700" border="0">
    <tr>
      <td height="31" align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij vast aantal beurten</h1>
      </td>
    </tr>
    <tr>
      <td height="459" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          <strong>Inleiding</strong><br>
          Bij een vast aantal beurten stopt de partij niet als één of beide spelers hun aantal te maken caramboles hebben bereikt, maar wordt er doorgespeeld totdat het afgesproken aantal beurten is gespeeld. U kunt aangeven dat u met een vast aantal beurten wilt spelen door het gewenst aantal vaste beurten in het lijstje te kiezen. Als u &quot;Nee&quot; kiest (dat staat standaard aangegeven), dan speelt u <b>niet</b> met een vast aantal beurten.<br>
          <br>
          <strong>Wat zijn de consequenties</strong><br>
          <ul>
            <li>Max aantal beurten: Bij de keuze van een vast aantal beurten, kunt u niet ook een maximaal aantal beurten kiezen. Uw eventuele keuze daar wordt genegeerd.
            <li>Puntentelling: U kunt alleen kiezen voor Winst=2 punten, Remise=1 punt en Verlies = 0 punten. Als u dat niet hebt gekozen, kunt u ook niet een vast aantal beurten kiezen.</li>
            <li>Winst, remise of verlies: Dit wordt uitsluitend bepaald op basis van gehaald % caramboles, berekend als aantal car gehaald gedeeld door aantal car te maken maal 100%.</li>
            <li>Percentage caramboles: In de stand kunnen er percentage caramboles getoond worden van meer dan 100%.</li>
            <li>Check bij uitslag invoeren of wijzigen: Standaard wordt er gechecked of het ingevoerde aantal gemaakte caramboles niet meer is dan het aantal dat deze speler moet maken,
              maar bij deze keuze is dat niet mogelijk. Let dus extra op bij wat u invoert.</li>
            <li>Gebruik scoreborden: Bij gebruik van een vast aantal beurten kunnen de scoreborden niet worden gebruikt.</li>
            <li>Talentvolle spelers: Mocht er opeens een speler meedoen met een aanvangsmoyenne van 10,00 of meer, dan kan de duur van een partij wel eens helemaal uit de hand lopen.</li>
          </ul>
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