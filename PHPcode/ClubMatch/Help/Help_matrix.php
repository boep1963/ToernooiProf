<?php
//© Hans Eekels, versie 07-06-2025
//Help bij matrix

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
      width: 600px;
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
  <table width="600" border="0">
    <tr>
      <td width="600" height="31" align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij Matrix en Planning</h1>
      </td>
    </tr>
    <tr>
      <td height="250" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          <strong>Matrix</strong><br>
          In de matrix kunt u zien wie al tegen wie heeft gespeeld in de gekozen periode. U "leest" een matrix altijd van links naar rechts, dus een groen vlakje betekent dat de speler uit de linker kolom heeft gewonnen van de speler in de bovenste rij. Wilt u de matrix in een andere periode bekijken (als er meerdere perioden zijn uiteraard), klik dan op de kleine knop met de gewenste periode om de matrix te verversen. U kunt de matrix ook uitprinten met de knop "Printen".
          <br><br>
          <strong>Planning</strong><br>
          Met de knop "Maak dag-planning" kunt u een vrijblijvende planning maken voor de speeldag (middag of avond) waarop u uw competitie organiseert. U kunt daar aanvinken welke spelers daadwerkelijk aanwezig zijn en hoeveel partijen de spelers op dat dagdeel moeten spelen. Het programma maakt een planning, gebaseerd op uw invoer. Deze planning is een suggestie; er worden hiermee geen partijen aangemaakt en u kunt de partijen alsnog indelen die u wilt.<br>
          NB: Heeft u een planning aangemaakt en komen er toch nog spelers bij (of er vallen spelers af) dan kunt u gewoon nog een keer een planning maken, maar nu met andere spelers aangevinkt.
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