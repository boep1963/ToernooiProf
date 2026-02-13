<?php
//© Hans Eekels, versie 09-08-2025
//Help bij planning en doorkoppeling scoreborden

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
        <h1>Help bij planning</h1>
      </td>
    </tr>
    <tr>
      <td height="250" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;"><strong>Algemeen</strong><br>
          U ziet hier de partijen die zijn gemaakt op basis van de door u aangevinkte aanwezige spelers, met tevens de mogelijkheid om die partijen door te koppelen naar uw elektronische scoreborden (tenzij u speelt met een vast aantal beurten).<br>Als er geselecteerde spelers niet zijn ingedeeld (omdat het programma geen vrije tegenspelers kon vinden), dan worden die namen en de ronde onderin vermeld.<br><br>
          <strong>Aantal partijen per speler</strong><br>
          U kon bij het selecteren van de aanwezige spelers aangeven of ze 1 of 2 partijen moeten spelen. Als u hebt gekozen voor 2 partijen en u hebt een oneven aantal spelers aangevinkt, dan wordt er, zo mogelijk, een laatste partij aangemaakt (in ronde 3) tussen de rustspelers uit ronde 1 en ronde 2.<br>
          <br>
          <strong>Doorkoppelen naar scoreborden</strong><br>
          Achter de partijen kunt u een gewenste partij doorkoppelen naar de wachtrij op uw scoreborden. U doet dat met de knop "Koppel" nadat u de gewenste partijen en gewenste tafelnummers hebt aangevinkt. NB: helemaal rechts kunt u met &eacute;&eacute;n knop alle tafels selecteren of de-selecteren per partij.<br>
          NB 1: Als u geen enkele tafel hebt geselecteerd, wordt die partij automatisch aan alle tafels toegevoegd.<br>
          NB 2: U kunt hier alleen partijen toevoegen aan de wachtrij, niet verwijderen uit de wachtrij. Dat kunt u uiteraard wel doen vanuit uw Beheersscherm en dan de knop "Beheer partijen".<br><br>
          <strong>Belangrijk !</strong><br>
          Als u het scherm met de planning afsluit (met Cancel), dan vervalt de getoonde planning. U kunt daarna, op elk moment dat u wenst, weer een nieuwe planning maken.
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