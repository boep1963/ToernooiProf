<?php
//© Hans Eekels, versie 22-06-2025
//ClubMatch account aanmaken
//aantal tafels toegevoegd
//email mag 40 tekens zijn

$Copy = Date("Y");

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>ClubMatch Online</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch Online" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_competitie.js" defer></script>
  <style type="text/css">
    body {
      width: 900px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <table width="900" border="0">
    <tr>
      <td width="210" height="105" align="center" valign="middle" bgcolor="#006600"><img src="Figuren/Logo.jpg" width="210" height="105" alt="Logo" /></td>
      <td width="680" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <h1>ClubMatch Online</h1><strong>Account aanmaken</strong>
      </td>
    </tr>
    <tr>
      <td height="50" colspan="2" align="center" bgcolor="#FFFFFF" class="grootzwart">
        U kunt hier gratis een account aanmaken, waarna u het programma ClubMatch Online onbeperkt kunt gebruiken. Vul de gegevens hieroner in en klik op "Verzenden".<br><br>
        U krijgt dan op uw e-mail een <strong>verificatiecode</strong> toegezonden die u in de volgende pagina moet invoeren.<br>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="80" align="center" valign="middle" bgcolor="#FF3300">
        <h1>Vul de volgende gegevens in:</h1>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="80" align="center" valign="middle" bgcolor="#FF3300">
        <form name="registreren" method="post" action="ClubMatch_account.php">
          <table width="890" border="0">
            <tr>
              <td width="294" height="50" bgcolor="#FF3300" class="grootwit"><strong>Naam organisatie (of clubnaam)</strong></td>
              <td width="317" align="center" bgcolor="#FF3300" class="grootwit">
                <input type="text" name="naam_org" minlength="5" maxlength="30" size="30" tabindex="1">
              </td>
              <td width="265" align="center" bgcolor="#FF3300">Naam (5 - 30 tekens) is verplicht en wordt getoond in het programma</td>
            </tr>
            <tr>
              <td width="294" height="50" bgcolor="#FF3300" class="grootwit"><strong>Naam wedstrijdleider</strong></td>
              <td width="317" align="center" bgcolor="#FF3300" class="grootwit">
                <input type="text" name="naam_wl" minlength="5" maxlength="30" size="30" tabindex="2">
              </td>
              <td width="265" align="center" bgcolor="#FF3300">Naam (5 -30 tekens) is verplicht, maar wordt alleen voor contact gebruikt </td>
            </tr>
            <tr>
              <td width="294" height="50" bgcolor="#FF3300" class="grootwit"><strong>Email wedstrijdleider</strong></td>
              <td width="317" align="center" bgcolor="#FF3300" class="grootwit">
                <input type="text" name="email_wl" maxlength="40" size="30" tabindex="3">
              </td>
              <td width="265" align="center" bgcolor="#FF3300">Email (max 40 tekens) is verplicht, maar wordt alleen voor contact gebruikt</td>
            </tr>
            <tr>
              <td width="294" height="50" bgcolor="#FF3300" class="grootwit"><strong>Aantal biljarttafels</strong></td>
              <td width="317" align="center" bgcolor="#FF3300" class="grootwit">
                <select name="tafels" style="font-size:18px;">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4" selected>4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </td>
              <td width="265" align="center" bgcolor="#FF3300">Als u straks partijen gaat toekennen aan tafelnummers, dan wordt het hier opgegeven aantal tafels gebruikt (u kunt dit aantal later nog aanpassen)</td>
            </tr>
            <tr>
              <td height="60" colspan="3" align="center" bgcolor="#FF3300">
                <input type="submit" style="width:190px; height:50px; background-color:#000; color:#FFF; font-size:16px;" value="Verzenden" title="Account aanmaken"
                  tabindex="5" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
              </td>
            </tr>
          </table>
        </form>
      </td>
    </tr>
    <tr>
      <td height="50" align="center" bgcolor="#006600">
        <input type="button" style="width:190px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
          onClick="location='../Start.php'" title="Cancel" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
      </td>
      <td align="right" bgcolor="#006600" class="klein">info: hanseekels@gmail.com &nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>