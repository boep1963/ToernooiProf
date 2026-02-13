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
        <h1>Help bij Overzichten</h1>
      </td>
    </tr>
    <tr>
      <td height="250" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          <strong>Stand</strong><br>
          De stand wordt opgemaakt op basis van punten of percentage-punten (dat is: hoeveel punten heeft een speler gehaald en hoeveel punten zou die speler gehaald kunnen hebben en dat als percentage). Daarmee worden spelers met een verschillend aantal gespeelde wedstrijden toch op een eerlijke manier met elkaar vergeleken in de stand.<br><br>
          <strong>Matrix</strong><br>
          In de matrix wordt weergegeven welke spelers al tegen elkaar hebben gespeeld.<br><br>
          <strong>Overzicht per speler</strong><br>
          In een overzicht per speler worden alle resultaten van de gekozen speler getoond, resulterend in een totaal behaald aantal caramboles en een eind-moyenne.
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