<?php
//© Hans Eekels, versie 02-11-2025
//Startpagina inloggen of account aanmaken
$Copy = Date("Y");

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Toernooi programma</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 900px;
      margin-top: 5px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <table width="900" border="0">
    <tr>
      <td width="210" height="105" align="center" valign="middle" bgcolor="#006600">
        <img src="Figuren/Logo_standaard.jpg" width="210" height="105" alt="Logo" />
      </td>
      <td width="680" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <h1>ToernooiProf Online</h1>
    </tr>
    <tr>
      <td height="50" colspan="2" align="center" bgcolor="#FFFFFF" class="grootzwart">
        <div align="center" style="margin:5px;">
          Met <strong>ToernooiProf Online</strong> kunt u Biljart-toernooien met individuele spelers aanmaken en beheren.<br>
          Het programma werkt met een onbeperkt aantal Ronden met maximaal 25 Poules per ronde, waarin een onbeperkt aantal spelers geplaatst kunnen worden.Tevens: automatische partij-aanmaak voor elke poule, na elke ronde kan het moyenne van de spelers aangepast worden, 3 punten-systemen, 6 manieren om het aantal te maken caramboles te bepalen, stand op basis van punten of % punten. Extra: eigen logo uploaden, werken met elektronische scoreborden en uitgebreide Handleiding.
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="80" align="center" valign="middle" bgcolor="#003300">
        <h1>Inloggen bestaande gebruiker</h1>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="80" align="center" valign="middle" bgcolor="#003300">
        <form name="inloggen" method="post" action="Toernooi_start.php">
          <table width="890" border="0">
            <tr>
              <td width="501" height="70" bgcolor="#003300" class="grootwit"><strong>&nbsp;Geregistreerde gebruiker met een inlogcode:</strong></td>
              <td width="180" align="center" bgcolor="#003300" class="grootwit">
                <strong>inlog-code</strong><br>
                <input type="password" name="user_code" minlength="10" maxlength="10" size="12" style="font-size:18px;" autofocus>
              </td>
              <td width="195" align="center" bgcolor="#003300">
                <input type="submit" style="width:190px; height:60px; background-color:#000; color:#FFF; font-size:16px;" value="Inloggen" title="Naar startscherm ToernooiProf Online"
                  onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
              </td>
            </tr>
          </table>
        </form>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="80" align="center" valign="middle" bgcolor="#FF3300" class="grootwit">
        <h1>Registreren nieuwe gebruiker</h1>
        <strong>Een account aanmaken is gratis en zo gebeurd. Uw inlogcode staat &eacute;&eacute;nmalig in beeld en u kunt daarmee direct een nieuw toernooi aanmaken.</strong>
      </td>
    </tr>
    <tr>
      <td height="80" colspan="2" align="center" valign="middle" bgcolor="#FF3300">
        <form name="registreren" method="post" action="Toernooi_registreren.php">
          <table width="890" border="0">
            <tr>
              <td colspan="2" align="center" bgcolor="#FF3300">
                <input type="submit" style="width:190px; height:60px; background-color:#000; color:#FFF; font-size:16px;" value="Account aanmaken" title="Naar registreren"
                  onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
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
      <td align="right" bgcolor="#006600" class="klein">info: hanseekels@gmail.com &nbsp;&copy;&nbsp; <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>