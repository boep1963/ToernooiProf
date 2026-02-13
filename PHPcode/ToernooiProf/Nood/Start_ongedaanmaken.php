<?php
//© Hans Eekels, versie 22-06-2025
//Start ongedaan maken: waarschuwing en consequenties
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Copy = Date("Y");
/*
var_dump($_POST) geeft:
array(2) { ["t_nummer"]=> string(1) "3" ["user_code"]=> string(10) "1000_KYZ@#" }
*/

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

if (isset($_POST['user_code'])) {
  $Code = $_POST['user_code'];
  if (strlen($Code) != 10) {
    $bAkkoord = FALSE;
  } else {
    $Gebruiker_naam = fun_testgebruiker($Code, $Path);
    if ($Gebruiker_naam == '9999') {
      $bAkkoord = FALSE;
    } else {
      $Gebruiker_nr = substr($Code, 0, 4);
      //logonaam
      $Logo_naam = "../Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['t_nummer'])) {
  $bAkkoord = FALSE;
} else {
  $Toernooi_nr = $_POST['t_nummer'];
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (count($_REQUEST) != 2) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
    <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
    <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../PHP/script_toernooi.js" defer></script>
    <style type="text/css">
      body {
        width: 500px;
        margin-top: 100px;
      }

      .button:hover {
        border-color: #FFF;
      }
    </style>
  </head>

  <body>
    <table width="500" border="0">
      <tr>
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="../Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
        <td width="340" align="center" valign="middle" bgcolor="#003300">
          <h1>Foutmelding !</h1>
        </td>
      </tr>
      <tr>
        <td height="50" colspan="2" align="center">
          <div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
            <?php print($error_message); ?>
          </div>
        </td>
      </tr>
      <tr>
        <td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
          <form name="partijen" method="post" action="../../Start.php">
            <input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

//start of ronde ongedaan maken
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
//pagain
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Start ongedaan maken</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 1000px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <form name="nieuw" method="post" action="Start_ongedaanmaken02.php">
    <table width="1000" border="0">
      <tr>
        <td width="170" height="85" align="left" valign="middle" bgcolor="#006600"><img src="../Figuren/Logo_standaard.jpg" width="170" height="85" alt="Logo" /></td>
        <td width="820" align="center" valign="middle" bgcolor="#006600">
          <?php
          if ($Huidige_ronde == 1) {
          ?>
            <h1>Start Toernooi ongedaan maken</h1>
          <?php
          } else {
          ?>
            <h1>Start Ronde&nbsp;<?php print("$Huidige_ronde"); ?>&nbsp;ongedaan maken</h1>
          <?php
          }
          ?>
        </td>
      </tr>
      <tr>
        <td colspan="2" align="center" valign="top" bgcolor="#009900" class="grootwit">
          <div align="center" style="margin-bottom:10px; margin-left:10px; margin-right:10px; margin-top:10px;">
            U kunt v&oacute;&oacute;r de start van uw toernooi altijd spelers toevoegen of verwijderen, maar na de start van uw toernooi is dat in principe niet meer mogelijk. Hetzelfde geldt voor de aanmaak van een nieuwe ronde; nadat u die ronde hebt gestart, wordt de nieuwe poule-indeling definitief. De aangemaakte partij-indelingen voor elke poule zijn namelijk afgestemd op het aantal spelers in de poules en die partij-indelingen worden onbruikbaar als er spelers in een poule bijkomen of spelers verwijderd worden.<br>
            Vandaar deze Nood-procedure om alsnog wijzigingen aan te brengen in de samenstelling van de reeds aangemaakte poules na de start van uw toernooi of na de start van een nieuwe ronde. Maar dat heeft consequenties !! </div>
          <div align="left" style="background-color:#F00; color:#FFF; margin-bottom:10px; margin-left:10px; margin-right:10px; margin-top:10px;">
            <strong>Consequenties als u een start ongedaan maakt:</strong>
            <ol>
              <li><strong>Alle partij-indelingen van alle poules in de zojuist aangemaakte ronde worden verwijderd !!</strong></li>
              <li><strong>Alle uitslagen die al in de nieuwe ronde zijn ingevoerd, worden verwijderd !!</strong></li>
              <li><strong>U keert terug naar de vorige ronde als u de aanmaak van een nieuwe ronde ongeaan maakt, of u keert terug naar Spelersbeheer als u de start van uw Toernooi ongedaan maakt.</strong></li>
            </ol>
          </div>
          <div align="center" style="background-color:#F00; color:#FFF; margin-bottom:10px; margin-left:10px; margin-right:10px; margin-top:10px;">
            Deze mogelijkheid om de Start van uw toernooi of een nieuwe ronde ongedaan te maken, is uiteraard opgenomen om niet in de problemen te komen vlak nadat u op start toernooi of start nieuwe ronde hebt geklikt er er nog geen uitslagen waren ingevoerd, maar ... u kunt de knop hieronder altijd gebruiken om, wanneer u maar wilt, opnieuw te beginnen met dit toernooi of de zojuist aangemaakte ronde.<br>
            <br>Als u op de knop &quot;Start ongedaan maken&quot; klikt, krijgt u <strong>geen waarschuwing</strong> meer !<br>
            <strong>Is dit niet de bedoeling ? Klik dan snel op de knop "Cancel"<br></strong>.
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="70" align="center" bgcolor="#009900">
          <input type="submit" class="submit-button" value="Start ongedaan maken" style="width:220px; height:60px; background-color:#F00; color:#FFF; font-size:16px;"
            title="Maak start toernooi ongedaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="../Toernooi_Beheer.php">
    <table width="1000">
      <tr>
        <td width="170" height="50" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" value="Cancel" style="width:150px; height:50px; background-color:#000; color:#FFF; font-size:16px;"
            title="Terug naar beheers" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </td>
        <td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>