<?php
//© Hans Eekels, versie 22-12-2024
//Help bij stand

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
      width: 400px;
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
  <table width="400" border="0">
    <tr>
      <td width="400" height="31" align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij stand</h1>
      </td>
    </tr>
    <tr>
      <td height="80" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">Bij het opmaken van de stand kunt u kiezen uit de volgende mogelijkheden, die u moet kiezen bij de radio-buttons:
          <ul>
            <li>De stand van de gekozen periode (kies ook die periode in de lijst) of de totaal-stand van alle perioden.</li>
            <li>De stand op basis van punten of op basis van percentage punten.</li>
          </ul>
          Als u een keuze hebt gemaakt, moet u even op de knop "Vernieuw stand" klikken.
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