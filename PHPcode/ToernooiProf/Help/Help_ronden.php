<?php
//© Hans Eekels, versie 22-06-2025
//Help bij nieuwe ronde
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
      width: 360px;
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
  <table width="365" border="0">
    <tr>
      <td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij aanmaak nieuwe ronde</strong></td>
    </tr>
    <tr>
      <td height="116" align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          Als u alle partijen in een bepaalde ronde hebt gespeeld, kunt u desgewenst weer een nieuwe ronde aanmaken. Het aantal ronden is onbeperkt.<br>
          Als u een nieuwe ronde aanmaakt, kunt u elke speler die u wilt, doorkoppelen naar de nieuwe ronde. Ook in de nieuwe ronde speelt u in poules en u kunt elke speler die u wilt in elke poule zetten die u wilt.<br><br>
          Een paar opmerkingen:
          <ul>
            <li>U moet in de nieuwe ronde minimaal 1 poule aanmaken; het maximum in elke ronde is 25 poules.</li>
            <li>In elke poule moeten minimaal 2 spelers geplaatst worden.</li>
            <li>Spelers die niet naar een volgende ronde worden doorgekoppeld, doen niet meer mee aan dit toernooi; u kunt ze dus niet meer koppelen aan ronden die u later nog aanmaakt.</li>
          </ul>
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