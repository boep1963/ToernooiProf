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
  <table width="600" border="0">
    <tr>
      <td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij datumvelden</strong></td>
    </tr>
    <tr>
      <td align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
        <div style="margin:5px;">
          <strong>Datumveld: vrije invoer</strong><br>
          Hier moet u een datum invoeren die ook getoond wordt bij uw toernooien. De invoer is vrij, dus zowel 12 augustus 2025 of augustus 2025 of seizoen 2025 is allemaal toegestaan.
          <br><br>
          <strong>Datumvelden: Start- en einddatum</strong><br>
          Hier dient u met de datumprikker (die tevoorschijn komt als u in het invoervak klikt) zowel een start- als een einddatum van uw toernooi ingeven. Deze data worden op de website van SpecialSoftware gebruikt om bezoekers inzicht te geven welke toernooien er op een zekere dag gespeeld worden in den lande. Uiteraard worden die data met uw toernooinaam en clubnaam alleen getoond als u onderin toestemming hebt gegeven dat bezoekers uw toernooi-standen live kunnen volgen omdat de standen openbaar zijn.
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