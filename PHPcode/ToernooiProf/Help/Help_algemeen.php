<?php
//© Hans Eekels, versie 22-06-2025
//Help algemeen
$Copy = Date("Y");

//verder
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Help</title>
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
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
      margin-top: auto;
      margin-right: auto;
      margin-bottom: auto;
      margin-left: auto;
      width: 770px;
    }

    input[type=button] {
      height: 30px;
      width: 100px;
      background-color: #CCC;
      color: #000;
    }

    .zwart {
      font-size: 14px;
      color: #000;
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
  <table width="770" border="0">
    <tr>
      <td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help algemeen</strong></td>
    </tr>
    <tr>
      <td align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
        <div style="margin:5px;">
          <strong>Partijen indeling</strong><br>
          Het programma maakt automatisch de partijen aan voor alle spelers in alle poules. Die partij-indelingen vindt u onder de knop "Uitslagen/Partijen", waarbij u altijd eerst even de gewenste poule moet kiezen. Met de aangeboden partijen in een poule spelen alle spelers &eacute;&eacute;n keer tegen elke andere speler.<br>
          Op deze pagina kunt u ook handmatig uitslagen invoeren of wijzigen. NB: als u gebruikt maakt van electronische scoreborden dan worden de resultaten van een gespeelde partij automatisch in dit programma verwerkt.<br><br>
          <strong>Poules en Ronden</strong><br>
          Dit programma werkt met poules (maximaal 25) en ronden (onbeperkt). Als u een nieuwe ronde aanmaakt, kunt u spelers uit de vorige ronde doorkoppelen naar de nieuwe ronde en in elke nieuwe poule zetten die u wilt. Op dat moment kunt u eventueel ook het moyenne van die speler aanpassen.<br><br>
          <strong>Overzichten</strong><br>
          De stand per poule kunt u opvragen en uitprinten. De stand kunt u op 2 manieren laten opstellen (zie helptekst bij de stand). Met de knop "Poule-indeling" kunt u een overzicht van de poules bekijken en uitprinten. Spelers die daar prijs op stellen, kunnen een overzicht krijgen met al hun resultaten.
          <br><br>
          <strong>Scoreborden</strong><br>
          Op een electronisch scorebord met een internet-verbinding kunnen de partijen per tafel worden getoond en beheerd. U maakt die partijen simpel aan met de knop "Uitslagen/Partijen". In de handleiding van dit programma staat het gebruik van scoreborden uitvoerig beschreven.
          <br><br>
          <strong>Noodknop</strong><br>
          Er is een noodknop om de start van het toernooi of de start van een nieuwe ronde ongedaan te maken. Vooral bedoeld om vlak na de start van het toernooi toch nog even terug te keren naar het scherm om spelers toe te voegen, te verwijderen en/of in een andere poule te zetten.
          Maar ook direct na de start van een nieuwe ronde kunt u terugkeren naar de vorige ronde om alsnog wijzigingen aan te brengen in de nieuwe poule-indelingen.<br><br>
          <strong>Diversen</strong><br>
          U kunt altijd de naam van een speler wijzigen. Die wijziging wordt dan direct doorgezet op overzichten en eventueel de scoreborden. Heeft u een groot toernooi en is het vinden van een speler in al die poules wat lastig, dan kunt u met een zoekfunctie die speler snel vinden. Tenslotte kunt u (vanaf ronde 2) in elke voorgaande ronde de poule-indelingen of de poule-standen opvragen met de knop &quot;Historie&quot;.
        </div>
      </td>
    </tr>
    <tr>
      <td height="32" align="center" bgcolor="#FFFFFF">
        <input type="button" value="Sluit Help" onClick="self.close()">
      </td>
    </tr>
  </table>
</body>

</html>