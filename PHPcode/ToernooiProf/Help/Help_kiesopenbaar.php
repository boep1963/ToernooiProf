<?php
//© Hans Eekels, versie 13-09-2025
//Help bij kies openbaar of niet
$Copy = Date("Y");

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
      width: 600px;
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
  <table width="605" border="0">
    <tr>
      <td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij toernooi al dan niet openbaar</strong></td>
    </tr>
    <tr>
      <td height="116" align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          U kunt hier aangeven of de toernooien die u gaat aanmaken in principe op de website van SpecialSoftware aan bezoekers getoond kunnen worden. De keuze: openbaar of niet kunt u per aangemaakt toernooi aangeven, maar hier moet u wat extra gegevens invoeren als er straks een toernooi openbaar wordt gemaakt. Als u zeker weet dat er nooit een toernooi openbaar wordt gemaakt, dan geeft u dat hier aan en zijn de extra gegevens niet nodig (en worden ook niet getoond). U kunt later altijd nog aangeven dat toernooien wel openbaar kunnen worden; die extra gegevens moet u dan later wel invoeren.<br>
          <br>
          In de overzichtslijst die bezoekers kunnen bekijken worden alle toernooien getoond die openbaar zijn verklaard met bijbehorende gegevens van de desbetreffende lokaliteit om een eventueel bezoek wat makkelijker te maken.<br><br>
          Als de lokaliteit dezelfde naam heeft als de biljartvereniging dan voert u hier de verenigingsnaam nog een keer in, anders de afwijkende naam van de lokaliteit. Het adres moet het adres van de lokaliteit (of club dus) zijn, omdat de bezoeker via Google Maps een plattegrond van dit adres wordt getoond plus een knop om de routeplanner van Google te starten.<br><br>
          Tenslotte kunt u aangeven of het email adres van de wedstrijdleider, voor eventuele informatie, getoond mag worden in het overzicht met toernooien voor bezoekers op de website.
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