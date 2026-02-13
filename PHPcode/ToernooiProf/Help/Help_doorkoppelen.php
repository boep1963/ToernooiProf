<?php
//© Hans Eekels, versie 22-06-2025
//Help bij doorkoppelen nieuwe ronde
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
      width: 500px;
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
  <table width="500" border="0">
    <tr>
      <td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij doorkoppelen naar nieuwe ronde</strong></td>
    </tr>
    <tr>
      <td align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
        <div style="margin:5px;">
          <strong>Algemeen</strong><br>
          Dit toernooi-programma werkt met ronden en poules. Als u klaar bent met de partijen van alle poules in een ronde, kunt u een nieuwe ronde aanmaken en de spelers van de vorige ronde doorkoppelen naar nieuwe poules in de nieuwe ronde. U kunt alle spelers uit een ronde doorkoppelen naar een volgende ronde, of slechts een deel van de spelers doorkoppelen.<br><strong>Op het moment van doorkoppelen, kunt u ook het moyenne van die speler aanpassen!</strong><br>U kunt pas partijen gaan beheren in de nieuwe ronde als u de nieuwe poules hebt gevuld en op de knop "Start nieuwe ronde" klikt.
          <br><br>
          <strong>Wat gebeurt er bij het aanmaken van een nieuwe ronde</strong><br>
          Bij het aanmaken van een nieuwe ronde koppelt u spelers uit de vorige ronde aan die nieuwe ronde en u plaatst die spelers in een nieuwe poule. Elke ronde heeft dus andere poules die qua aantal als samenstelling anders kunnen zijn dan in de vorige ronde.<br>
          Nadat u de nieuwe poules hebt gevuld en op de startknop hebt gedrukt, worden per poule de partijen aangemaakt op basis van het aantal spelers in de poules. U werkt dan in de nieuwe ronde; de partijen worden in die nieuwe ronde gespeeld en de standen in de nieuwe poules betreffen alleen de resultaten van de spelers in de nieuwe ronde.
          <br>
          <br>
          <strong>Noodknop</strong><br>
          Ook na het aanmaken van een nieuwe ronde is er een noodknop beschikbaar in het beheersscherm. U kunt daarmee de start van een nieuwe ronde ongedaan maken. Lees aandachtig de helptekst bij gebruik van die optie.
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