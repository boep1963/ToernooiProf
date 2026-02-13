<?php
//© Hans Eekels, versie 22-04-2025
//Help pagina

$Copy = Date("Y");

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Help bij ClubMatch Online</title>
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
      margin-top: 10px;
      margin-right: auto;
      margin-bottom: 0px;
      margin-left: auto;
      width: 1000px;
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
  <table width="1000" border="0">
    <tr>
      <td colspan="4" align="center" valign="middle" bgcolor="#009900">
        <h1>Help algemeen</h1>
      </td>
    </tr>
    <tr>
      <td width="250" height="40" align="center" bgcolor="#009900"><strong>Algemeen</strong></td>
      <td width="250" align="center" bgcolor="#009900"><strong>Leden</strong></td>
      <td width="250" align="center" bgcolor="#009900"><strong>Competities</strong></td>
      <td align="center" bgcolor="#009900"><strong>Extra's</strong></td>
    </tr>
    <tr>
      <td align="center" valign="top" bgcolor="#009900">
        <div style="text-align:left; margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          Dit biljartprogramma is bedoeld voor een competitie op een biljartvereniging.<br>
          Een competitie moet u eerst aanmaken. Leden moet u ook eerst invoeren met een naam en een moyenne per discipline.<br>
          Vervolgens kunt u per aangemaakte competitie zoveel spelers daaraan koppelen als u wilt.<br>
          NB: Een lid kunt u ook aan elke andere competitie koppelen die u wilt.
        </div>
      </td>
      <td align="center" valign="top" bgcolor="#009900">
        <div style="text-align:left; margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          Leden moeten eerst ingevoerd worden met een naam en een moyenne per discipline. Elk lid krijgt automatisch een nummer toegewezen (voor programma-technisch gebruik).<br>
          Leden kunt u wijzigen of verwijderen.<br>U kunt een overzicht opvragen (en eventueel uitprinten) van alle leden die u hebt ingevoerd.<br>
          Let op 1: Als u een moyenne wijzigt van een lid die als speler aan een competitie is gekoppeld, dan wordt het moyenne van die speler in die competitie niet aangepast; bij koppeling aan een nieuwe competitie wordt altijd wel het laatst bekende moyenne gebruikt.<br>
          Let op 2: Als een lid aan een competitie is gekoppeld, dan kunt u dat lid niet verwijderen. U kunt een speler in een competitie wel verwijderen.

        </div>
      </td>
      <td align="center" valign="top" bgcolor="#009900">
        <div style="text-align:left; margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          U kunt net zoveel competities aanmaken als u wilt. Aan elke competitie moet u spelers koppelen uit de lijst met leden die u hebt ingevoerd. Bij competities kunt u kiezen uit:
          <ul>
            <li>Diverse moyenne-formules om het aantal te maken caramboles te bepalen;</li>
            <li>Drie punten-systemen (Winst=2, Remise=1, Verlies=0, of het 10 punten systeem (elke 10% gemaakte caramboles levert 1 punt op) of het Belgisch systeem;</li>
            <li>Minimaal aantal te maken caramboles;</li>
            <li>Een beurtenlimiet indien gewenst.</li>
          </ul>
          Van een aangemaakte competitie kunt u later nog de naam, de datum of het puntensysteem wijzigen.
        </div>
      </td>
      <td align="center" valign="top" bgcolor="#009900">
        <div style="text-align:left; margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">U kunt uw eigen Logo uploaden.<br><br>
          Bij gebruik van score-borden kunt u daarop een slide-show draaien met adverteerders of mededelingen.<br>
          <br>
          Bij gebruik van score-borden kunt u bij elke partij een foto (avatar) van de speler tonen. Het beheer van die avatars kunt u hier regelen.<br>
          <br>
          U kunt de naam van uw organisatie, het aantal tafels en of u al dan niet de Nieuwsbrief wilt ontvangen wijzigen. Ook de bediening van de score-borden (met muis of tablet) kunt u hier wijzigen.<br><br>
          U kunt uw Account verwijderen.
        </div>
      </td>
    </tr>
    <tr>
      <td height="30" align="center" bgcolor="#009900">
        <input type="button" value="Sluit Help" onClick="self.close()" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
      </td>
      <td align="center" bgcolor="#009900">&nbsp;</td>
      <td colspan="2" align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>