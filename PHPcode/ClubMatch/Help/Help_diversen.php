<?php
//© Hans Eekels, versie 21-11-2025
//Help bij diversen
//Periode terugdraaien toegevoegd
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
      width: 850px;
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
  <table width="850" border="0">
    <tr>
      <td height="31" align="center" valign="middle" bgcolor="#009900">
        <h1>Help bij Diversen</h1>
      </td>
    </tr>
    <tr>
      <td align="left" valign="top" bgcolor="#009900">
        <div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px;">
          <strong>Beheer Partijen</strong><br>Bij een klik op deze knop krijgt u de mogelijkheid om partijen aan te maken of niet gebruikte partijen te verwijderen.<br>
          <em>Aanmaken:</em> Als u de bijbehorende scoreborden wilt gebruiken tijdens de wedstrijden, dan moet u eerst die partijen aanmaken die u wilt spelen en wilt bijhouden met de scoreborden. Dat is zo gebeurd, omdat u in de matrix met de groene knop 2 spelers kunt selecteren. De aangemaakte partijen zijn dan met de knop "Scoreborden" in uw startscherm op te roepen.<br>
          <em>Verwijderen:</em> partijen die zijn verwerkt met een scorebord worden automatsich verwijderd; partijen die u wel hebt aangemaakt, maar om wat voor reden dan ook niet hebt gebruikt, kunt u bewaren voor later of verwijderen met de gele knop.<br><br>
          <strong>Moyennes doorkoppelen</strong><br>
          U kunt op elk moment dat u wilt de behaalde moyennes van de spelers toevoegen aan die spelers als leden, zodat u die leden met een aangepast moyenne aan een nieuwe competitie kunt koppelen.<br>
          NB 1: U hoeft deze mogelijkheid niet te gebruiken; de moyennes bij de leden worden dan niet aangepast op basis van behaalde moyennes in deze competitie.<br>
          NB 2: Zolang u in uw startscherm de knop "Verwijder bestaande competitie" niet hebt gebruikt, kunt u behaalde moyennes doorvoeren bij de leden. Het kan dus na elke periode of pas op het einde van de competitie en u kunt steeds uit een paar varianten kiezen welk behaald moyenne nu precies doorgekoppeld moet worden.<br><br>
          <strong>Nieuwe periode</strong><br>
          Als iedereen tegen elkaar heeft gespeeld (of als u te weinig partijen kunt aanmaken) kunt u hier een Nieuwe periode starten. Dat betekent dat de moyennes van de spelers aangepast kunnen worden (keuze) en dat de matrix weer leeg wordt gemaakt, zodat iedereen weer tegen elkaar kan spelen.<br>
          NB 1: Bij het verlagen van een moyenne wordt rekening gehouden met het opgegeven minimum aantal te maken caramboles.<br>
          NB 2: U kunt maximaal in 5 perioden spelen; daarna moet u een nieuwe competitie aanmaken.<br><br>
          <strong>Periode terugdraaien</strong><br>
          De mogelijkheid om een zojuist aangemaakte periode terug te draaien is toegevoegd omdat is gebleken dat er redelijk vaak een vergissing wordt gemaakt bij het aanmaken van een nieuwe periode. Te denken valt aan: vergeten om een moyenne bij een of meer spelers aan te passen, of het moyenne is bij alle spelers aangepast, maar de bedoeling was om het moyenne bij geen van de spelers aan te passen. Voor deze en mogelijk nog andere redenen is het mogelijk om het aanmaken van een nieuwe periode terug te draaien. Dat kan overigens alleen als er in de periode die u wilt terugdraaien nog geen uitslagen zijn ingevoerd ! Is dat wel zo en wilt u toch de periode terugdraaien, verwijder dan eerst handmatig alle uitslagen uit de periode die moet vervallen.
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