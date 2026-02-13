<?php
//© Hans Eekels, versie 04-12-2024
//Help bij uitslagen

$Copy = Date("Y");

//verder
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Help</title>
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
      margin-top: 0px;
      margin-right: auto;
      margin-bottom: 0px;
      margin-left: auto;
      width: 500px;
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
    function mouseIn(event) {
      var image = event.srcElement;
      image.border = '2';
      image.style.borderColor = "#FFF";
    }

    function mouseOut(event) {
      var image = event.srcElement;
      image.border = '0';
    }

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
  <table width="500" border="0">
    <tr>
      <td width="500" height="31" align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij Uitslagen</h1>
      </td>
    </tr>
    <tr>
      <td align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;"><strong>Uitslag invoeren</strong><br>
          U kunt twee spelers kiezen en een uitslag invoeren van een gespeelde wedstrijd.<br>
          NB: U kunt er ook voor kiezen om eerst een partij aan te maken (met de knop Beheer Partijen) die u oproept op een scorebord, waarna de uitslag automatisch in dit programma wordt opgenomen.<br><br>
          <strong>Uitslag wijzigen</strong><br>U kunt hier elke uitslag wijzigen die u wilt, dus zowel de uitslagen die u zelf hebt ingevoerd als de uitslagen die vanuit de scoreborden zijn ingevoerd.<br><br>
          <strong>Uitslag verwijderen</strong><br>U kunt elke uitslag verwijderen die u wilt.<br>
          Let op: als u een uitslag verwijdert bij een speler worden de resultaten van de tegenstander ook verwijderd en zal bij het oproepen van de stand de verwijderde partij niet meer worden meegenomen.<br><br>
        <strong>Overzicht uitslagen</strong><br>
        U kunt hier alle partij-uitslagen tussen een zelf in te stellen start- en einddatum oproepen en uitprinten.
        </div>
      </td>
    </tr>
    <tr>
      <td height="32" align="center" bgcolor="#009900">
        <input type="button" value="Sluit Help" onClick="self.close()">
      </td>
    </tr>
  </table>
</body>

</html>