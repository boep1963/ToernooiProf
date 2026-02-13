<?php
//© Hans Eekels, versie 14-12-2025
//Help pagina
//aangepast aan 2 systemen car (form of vrij)

$Copy = Date("Y");

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Help bij Toernooi=programma</title>
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
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
</head>

<body>
  <table width="1000" border="0">
    <tr>
      <td width="213" height="85" align="left" valign="middle" bgcolor="#009900"><img src="../Figuren/Logo_standaard.jpg" width="170" height="85" alt="Logo" /></td>
      <td colspan="3" align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij Toernooi-programma</h1>
      </td>
    </tr>
    <tr>
      <td height="40" align="center" bgcolor="#009900"><strong>Algemeen</strong></td>
      <td align="center" bgcolor="#009900"><strong>Spelers</strong></td>
      <td align="center" bgcolor="#009900"><strong>Mogelijkheden</strong></td>
      <td align="center" bgcolor="#009900"><strong>Scoreborden</strong></td>
    </tr>
    <tr>
      <td height="328" align="center" valign="top" bgcolor="#009900">
        <div style="text-align:left; margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          Met dit programma kunt u zowel een klein als een groot biljart-toernooi aanmaken en beheren. Het programma werkt met poules en met ronden. In de poules worden onderlinge partijen gespeeld met een rangschikking als resultaat. Daarna kunnen spelers in vervolg-ronden wederom in poules ingedeeld worden.<br><br>Het aantal spelers en het aantal ronden is feitelijk onbeperkt; het aantal poules is (om praktische redenen) beperkt tot 25.
        </div>
      </td>
      <td width="278" align="center" valign="top" bgcolor="#009900">
        <div style="text-align:left; margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          Spelers
          moet u invoeren met een naam en een moyenne (minimaal 0.250). Op basis van verschillende moyenne-formules (waaruit u kunt kiezen) worden de aantallen te maken caramboles voor de deelnemers bepaald.
          U kunt er ook voor kiezen om die aantallen bij elke speler apart in te voeren.<br><br>Voordat het toernooi is gestart, kunt u spelers wijzigen en verwijderen. Na de start van het toernooi kunt u alleen de naam van de speler nog wijzigen.<br><br>
          Er is een Noodknop om de start van het toernooi of de start van een nieuwe ronde ongedaan te maken.
        </div>
      </td>
      <td width="278" align="center" valign="top" bgcolor="#009900">
        <div style="text-align:left; margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          Het programma maakt voor elke poule automatisch de partijen aan, waarbij elke speler &eacute;&eacute;n keer tegen elke andere speler is ingedeeld.<br><br>
          U kunt spelen met een beurtenlimiet.<br><br>
          U kunt op 2 manieren de stand opstellen: normaal op volgorde van punten en dan % caramboles, of op basis van % punten.<br><br>
          U kunt een overzicht van de poule-indelingen in elke ronde oproepen.<br><br>
          U kunt een overzicht per speler oproepen en uitprinten.<br><br>
          U kunt opzoeken in welke poule een speler is ingedeeld.
        </div>
      </td>
      <td align="center" valign="top" bgcolor="#009900">
        <div style="text-align:left; margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          Als er gebruik wordt gemaakt van elektronische scoreborden die werken als een pc met een internetverbinding, dan kunnen vanuit dit programma de aangemaakte partijen per tafel op de scoreborden worden opgeroepen en worden de behaalde uitslagen automatisch in dit programma ingevoerd.<br><br>NB: Voor het gebruik van elektronische scoreborden is een aparte handleiding beschikbaar.
        </div>
      </td>
    </tr>
    <tr>
      <td height="30" align="center" bgcolor="#009900">
        <input type="button" value="Sluit Help" onClick="self.close()">
      </td>
      <td align="center" bgcolor="#009900">&nbsp;</td>
      <td colspan="2" align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?></td>
    </tr>
  </table>
</body>

</html>