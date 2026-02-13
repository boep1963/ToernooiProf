<?php
//© Hans Eekels, versie 22-06-2025
//Startpagina ClubMatch Online inloggen of account aanmaken

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
      <td width="210" height="105" align="center" valign="middle" bgcolor="#003300">
        <img src="Figuren/Logo.jpg" width="210" height="105" alt="Logo" />
      </td>
      <td width="680" align="center" valign="middle" bgcolor="#003300" class="grootwit">
        <h1>ClubMatch Online</h1>
    </tr>
    <tr>
      <td height="50" colspan="2" align="center" bgcolor="#FFFFFF" class="grootzwart">
        <div align="center" style="margin:5px;">
          Met <strong>ClubMatch Online</strong> kunt u clubcompetities met individuele spelers aanmaken en beheren.<br>
          Een competitie (in elke discipline die u wilt) omvat maximaal 5 perioden. De spelers beheert u in een aparte module, waarna u spelers aan elke competitie kunt koppelen die u wilt. Uiteraard: overzichten, standen, matrix gespeelde partijen, etc. Extra: eigen logo uploaden, mogelijkheid tot werken met elektronische scoreborden, avatars (pasfoto's) van spelers uploaden en een uitgebreide Handleiding.
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
        <form name="inloggen" method="post" action="ClubMatch_start.php">
          <table width="890" border="0">
            <tr>
              <td width="501" height="70" bgcolor="#006600" class="grootwit"><strong>&nbsp;Geregistreerde gebruiker met een inlogcode:</strong></td>
              <td width="180" align="center" bgcolor="#006600" class="grootwit">
                <strong>inlog-code</strong><br>
                <input type="password" name="user_code" minlength="10" maxlength="10" size="12" style="font-size:18px;" autofocus>
              </td>
              <td width="195" align="center" bgcolor="#006600">
                <input type="submit" class="submit-button" style="width:190px; height:60px; background-color:#000; color:#FFF; font-size:16px;" value="Inloggen" title="Naar startscherm ClubMatch Online"
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
        <strong>Een account aanmaken is gratis en zo gebeurd. Uw inlogcode staat &eacute;&eacute;nmalig in beeld en u kunt daarmee direct een competitie aanmaken.</strong>
      </td>
    </tr>
    <tr>
      <td height="80" colspan="2" align="center" valign="middle" bgcolor="#FF3300">
        <form name="registreren" method="post" action="ClubMatch_registreren.php">
          <table width="890" border="0">
            <tr>
              <td colspan="2" align="center" bgcolor="#FF3300">
                <input type="submit" class="submit-button" style="width:190px; height:60px; background-color:#000; color:#FFF; font-size:16px;" value="Account aanmaken" title="Naar registreren"
                  onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
              </td>
            </tr>
          </table>
        </form>
      </td>
    </tr>
    <tr>
      <td height="50" align="center" bgcolor="#003300">
        <input type="button" class="submit-button" style="width:190px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
          onClick="location='../Start.php'" title="Cancel" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
      </td>
      <td align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com &nbsp;&copy;&nbsp; <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>