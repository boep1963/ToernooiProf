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
      <td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij stand openbaar</strong></td>
    </tr>
    <tr>
      <td height="116" align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          U kunt hier wijzigen of u de stand alleen zichtbaar wil houden op de computer waarmee u dit toernooi beheert (en mogelijk ook via een monitor in de speelzaal toont),
          of dat ook buitenstaanders de standen van uw toernooi kunnen opvragen.<br><br>
          NB: Dat kunt u alleen wijzigen als u bij de organisatie-gegevens hebt aangegeven dat toernooien openbaar mogen zijn (dat kunt u daar ook aanpassen).
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