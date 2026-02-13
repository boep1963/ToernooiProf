<?php
//© Hans Eekels, versie 16-04-2024
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
        <h1>Help bij Periode-overgang</h1>
      </td>
    </tr>
    <tr>
      <td height="128" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          <strong>Periode-overgang</strong><br>
          Vanuit periode 1 t/m 4 kunt u een volgende periode aanmaken. Daarbij kunt u per speler in de lijst aangeven (door aan te vinken !) of het nieuwe moyenne gaat gelden voor de nieuwe periode. Als u geen vinkje bij een speler zet, blijft het oude moyenne van die speler ook gelden in de nieuwe periode.<br><br>
          NB: Bent u niet akkoord met het voorgestelde moyenne en bijbehorend aantal te maken caramboles, dan kunt u het nieuwe moyenne voor de volgende periode ook aanpassen. Als u dat moyenne aanpast, zult u zien dat het aantal te maken caramboles automatisch ook wordt aangepast (op basis van de eerder gekozen moyenne-formule).
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