<?php
//© Hans Eekels, versie 20-07-2025
//Help bij planning

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
      <td align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij planning</h1>
      </td>
    </tr>
    <tr>
      <td height="250" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;"><strong>Algemeen</strong><br>
          U kunt hier een vrijblijvende planning maken voor een speeldag in uw competitie. Vink de spelers aan die al aanwezig zijn (of die u zeker verwacht) en kies het aantal partijen (1 of 2) dat het programma moet maken. Klik dan op &quot;Maak planning&quot; en het programma genereert partijen tussen spelers die nog gespeeld kunnen worden. U kunt de planning ook uitprinten.<br>NB: De partijen die worden voorgesteld, zijn vrijblijvend; u hoeft ze uiteraard niet te gebruiken.
          <br><br>
          <strong>Aantal partijen: suggestie</strong><br>
          Als u een <strong>even aantal spelers</strong> hebt geselecteerd, dan wordt geadviseerd om te kiezen voor de aanmaak van &eacute;&eacute;n partij per speler. Als die gespeeld zijn, kunt u een nieuwe planning maken voor de volgende partij, waarbij gelijk rekening gehouden kan worden met spelers die al vertrokken zijn of pas later zijn binnen gekomen.<br>
          Als u een <strong>oneven aantal spelers</strong> hebt geselecteerd, dan wordt geadviseerd om te kiezen voor de aanmaak van twee partijen per speler. Bij een oneven aantal spelers hebt u per ronde altijd een rustspeler. Bij een oneven aantal spelers en een keuze voor 2 partijen, maakt het programma toch een planning waarbij iedereen 2 keer kan spelen. De 2 rustspelers uit elke ronde worden dan namelijk tegen elkaar ingedeeld.<br>
          <br>
          NB 1: Als wedstrijdleider bepaalt u uiteraard hoeveel partijen u wilt spelen per dagdeel. Of u nu kiest voor 1 of voor 2 partijen bij aanmaak van de planning, u kunt altijd daarna weer een planning maken en daar zit geen maximum aan.<br><br>
          NB 2: Zeker aan het einde van een periode wordt het steeds lastiger om vrije partijen te vinden, waarbij elke aanwezige speler nog kan worden ingedeeld. Dat geldt ook voor het programma. Als er geen partijen gevonden kunnen worden voor een of meer spelers, dan wordt dat vermeld.<br>
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