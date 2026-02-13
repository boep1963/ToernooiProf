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
      <td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij Planning en Uitslagen verwerken</strong></td>
    </tr>
    <tr>
      <td align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
        <div style="margin:5px;">
          <strong>Planning</strong><br>
          Op deze pagina worden alle, door het programma gegenereerde, partijen in de gekozen poule getoond. In het schema spelen alle spelers in de poule &eacute;&eacute;n maal tegen elke andere speler. Bij een even aantal spelers, zijn alle spelers opgesteld in een speelronde; bij een oneven aantal spelers heeft elke speler een rustronde.<br>Let op: u kunt nooit meer partijen in een poule spelen dan hier getoond. Minder kan wel, maar bij een oneven aantal spelers, zijn er dan altijd spelers die een partij minder hebben gespeeld dan de anderen. In de stand kunt u die onevenwichtigheid omzeilen door de stand op te laten maken op basis van %-punten (zie aldaar).

          <br><br>
          <strong>Verwerking uitslagen</strong><br>
          Twee manieren:
          <ol>
            <li>
              Als u electronische scoreborden gebruikt, dan kunt u partijen aanmaken die daarop getoond worden (zie de aparte helpknop). Na afloop van een partij wordt de uitslag automatisch in dit programma verwerkt. NB: Dit is ook de reden dat u onderaan dit scherm een knop "Refresh" ziet staan. Met een klik op die knop worden ook de meest recente uitslagen vanuit de scoreborden in het overzicht verwerkt.</li>
            <li>
              U kunt uitslagen ook handmatig invoeren en wijzigen. Gebruik dan de groene knop naast een partij in deze planning om die uitslag in te voeren (of de oranje knop naast een partij, als die partij al is gespeeld en u wilt die uitslag nog wijzigen).</li>
          </ol>
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