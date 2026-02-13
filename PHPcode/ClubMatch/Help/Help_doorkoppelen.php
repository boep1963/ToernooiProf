<?php
//© Hans Eekels, versie 21-04-2025
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
      width: 700px;
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
  <table width="700" border="0">
    <tr>
      <td height="31" align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij doorkoppelen moyenne naar leden</h1>
      </td>
    </tr>
    <tr>
      <td height="250" align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          <strong>Inleiding</strong><br>
          Leden van een vereniging hebben voor elke discipline een start-moyenne, dat gebruikt wordt als zo'n lid wordt gekoppeld aan een competitie. In een competitie heet een lid een speler en een speler haalt in elke gespeelde periode (maximaal 5) een bepaald moyenne. Bij het aanmaken van een nieuwe periode (dat doet u elders) kunt u ook aangeven of het eindmoyenne van de oude periode als startmoyenne moet dienen voor de nieuwe periode.<br>
          Hier kunt u een behaald moyenne doorkoppelen naar de leden, zodat het moyenne van een bepaalde discipline van dat lid wordt aangepast. Handig als u een nieuwe competitie wilt aanmaken en daar leden aan wilt koppelen die in een vorige competitie qua moyenne zijn gestegen of zijn gedaald.

          <br>
          <br>
          <strong>Welk moyenne kunt u kiezen</strong><br>
          Meestal wordt het eindmoyenne gebruikt dat een speler in de hele competitie heeft gespeeld. Dat moyenne staat in de laatste kolom met de naam Totaal en die kolom is standaard aangeklikt. Maar u kunt, om wat voor reden dan ook, ook een aparte periode kiezen; klik dan die kolom aan en de behaalde moyennes in die periode worden doorgekoppeld naar de leden.<br><br>
          <strong>Kies spelers</strong><br>
          Naast het kiezen van de gewenste kolom met behaalde moyennes, moet u ook de spelers aanvinken (dat doet u links door al dan niet een selectie-hokje aan te vinken), waarvan de moyennes doorgekoppeld moeten worden. Klik op &quot;Akkoord&quot; om de gekozen moyennes bij de gekozen spelers te verwerken, of klik anders op &quot;Cancel&quot;; dan wordt er niets aangepast.
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