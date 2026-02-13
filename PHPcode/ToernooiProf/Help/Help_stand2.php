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
      width: 730px;
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
  <table width="730" border="0">
    <tr>
      <td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij kiezen soort stand</strong></td>
    </tr>
    <tr>
      <td align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
        <div style="margin:5px;">
          <strong>Algemeen</strong><br>
          Bij het oproepen van de stand wordt de stand getoond in de huidige ronde en wordt de volgorde in de stand bepaald op basis van: meeste punten, dan % caramboles, dan hoogste serie en dan moyenne.<br>
          Echter, u kunt hier altijd kiezen of de stand opgemaakt moet worden op basis van Punten of op basis van Percentage Punten.<br><br>
          <strong>Keuze normale punten of percentage punten</strong><br>
          Standaard wordt de stand getoond die is opgemaakt op basis van meeste punten. Als alle spelers even veel partijen hebben gespeeld, geeft dat ook de meest re&euml;le volgorde in de stand en zult u zien dat het dan niet uitmaakt welke methode u kiest.<br>
          Echter, als spelers niet allemaal even veel partijen hebben gespeeld, dan is de kans dat een speler met minder gespeelde partijen toch hoog in de stand eindigt, erg klein, ook al speelt die speler feitelijk beter dan de speler die boven hem of haar staat. Voor deze gevallen kunt u de stand ook opmaken op basis van percentage punten. Dan wordt er eerst gekeken hoeveel punten de spelers hadden kunnen halen, en vervolgens hoeveel punten de spelers daadwerkelijk hebben gehaald. Dat laatste aantal wordt als percentage van het maximaal te halen punten getoond.<br>
          <br>
          Voorbeeld:<br>
          Henk heeft 4 partijen gespeeld, daarvan 3 gewonnen en 1 verloren. Hij had 8 punten kunnen halen, maar heeft 6 punten gehaald. Percentage punten is nu (6 / 8)* 100 = 75 %<br>
          Piet heeft 3 partijen gespeeld en allemaal gewonnen. Hij had 6 punen kunnen halen en heeft er ook 6 gehaald. Zijn percentage punten is dan (6 / 6) * 100 = 100 %<br>
          Piet komt dus in de stand boven Henk te staan, ondanks het feit dat hij minder partijen heeft gespeeld.<br>
          NB: deze methode werkt zeer onredelijk als speler A 100 partijen heeft gespeeld en daar 99 van heeft gewonnen en 1 verloren en deze speler wordt vergeleken met speler B die slechts 1 partij heeft gespeeld en die heeft gewonnen. A heeft dan een percentage punten van 99 % en B van 100 % en dat is meer dan 99 %. Dat voelt niet goed uiteraard. De percentage-methode is een redelijk systeem als het aantal gespeelde partijen weinig van elkaar verschilt. Als u in tijdnood komt om alle partijen te laten spelen, dan is bij een verschil in aantal gespeelde partijen van 1 of 2 de methode percentage punten zeker te verdedigen.
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