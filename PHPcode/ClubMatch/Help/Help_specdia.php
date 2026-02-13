<?php
//© Hans Eekels, versie 25-12-2024
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
      <td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij specificaties van slides</strong></td>
    </tr>
    <tr>
      <td align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
        <div style="margin:5px;">
          <strong>Afmetingen</strong><br>
          De “slides” die getoond worden, moeten allemaal jpg-bestanden, dus figuren zijn. Die figuren (foto’s of teksten opgeslagen als jpg-bestand) dienen bij voorkeur een hoge resolutie te hebben.
          De afmetingen op het scorebord zijn altijd 1900px breed en 950px hoog. De afmeting van uw bestand mag daar van afwijken, maar de verhouding lengte : breedte moet altijd zijn 2 : 1.<br>
          Verder is de grootte van het bestand beperkt tot 2 MB (dus 2000 KB).<br><br>
          <strong>Figuren of tekst</strong>
          Wellicht zult u de slides gebruiken voor advertenties van uw sponsors, maar misschien wilt u ook mededelingen van de wedstrijdleiding op de borden tonen. Dan moet u de tekst daarvan ook opslaan in een jpg-bestand ! Met een programma als Paint of PowerPoint is dat makkelijk te realiseren.<br><br>
          <strong>Uploaden</strong><br>
          Bij het uploaden wordt de Bestands-structuur op uw computer geopend en kunt u daarin zoeken naar de juiste map en de gewenste figuur. Dit programma zet uw slides in een speciale map op de server en de namen van uw bestanden krijgen een extensie waaruit bepaald kan worden bij welke gebruiker de bestanden horen.
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