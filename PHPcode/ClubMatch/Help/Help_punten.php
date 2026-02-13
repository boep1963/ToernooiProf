<?php
//© Hans Eekels, versie 04-09-2025
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
      <td height="31" align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij punten-systeem</h1>
      </td>
    </tr>
    <tr>
      <td height="80" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">U kunt kiezen uit 3 punten-systemen, tenzij u hierna kiest voor een vast aantal beurten; dan kunt u alleen het eerste systeem W-R-V kiezen:
          <ol>
            <li>Winst = 2 punten, Remise = 1 punt en Verlies = 0 punten; bij dit systeem kunt u ook kiezen om een extra punt toe te kennen bij spelen boven het moyenne. Als u daarvoor kiest, kunt u ook aangeven of dat alleen geldt bij winst of ook bij remise en verlies.</li>
            <li>10 punten-syteem: 1 punt per 10% gemaakt aantal caramboles, naar beneden afgerond;</li>
            <li>Belgisch systeem: als 10 punten-systeem, maar 2 extra punten bij winst en 1 extra punt bij remise. NB: als een partij niet is uitgespeeld, vervallen de extra punten!</li>
          </ol>
        </div>
      </td>
    </tr>
    <tr>
      <td height="32" align="center" bgcolor="#009900">
        <input type="button" value="Sluit Help" onClick="self.close()" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
      </td>
    </tr>
  </table>
</body>

</html>