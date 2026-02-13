<?php
//© Hans Eekels, versie 22-06-2025
//delete account
//record tp_gebruikers
//alle toernooibestanden
//logo
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(1) { 
["user_code"]=> string(10) "1000_KYZ@#" }
*/
$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

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
      $Logo_naam = "Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (count($_POST) != 1) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
    <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
    <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="PHP/script_toernooi.js" defer></script>
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
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
          <form name="partijen" method="post" action="../Start.php">
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
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Account verwijderen</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 700px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <table width="700" border="0">
    <tr>
      <td width="170" height="85" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
      <td width="520" align="center" valign="middle" bgcolor="#006600">
        <h1>Account verwijderen</h1>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">U staat op het punt uw account met de naam:
        <h2><?php print("$Gebruiker_naam"); ?></h2>
        te verwijderen
      </td>
    </tr>
    <tr>
      <td colspan="2" align="center" valign="middle" bgcolor="#FF0000" class="grootwit">
        <div style="margin:10px">
          <strong>WAARSCHUWING<br><br>
            Als u uw account verwijdert, worden alle aangemaakte toernooien definitief verwijderd ! Ook alle gegevens als spelers, poules, ronden, wedstrijden en uitslagen worden definitief verwijderd ! Tenslotte: ook een ge-upload eigen logo en alle slides van uw dia-show worden definitief verwijderd !<br>
            <br>
            Een verwijdering van uw account kunt u niet meer ongedaan maken !</strong><br><br>
          (Uiteraard kunt u in het beginscherm van dit programma een nieuw account aanmaken, waarmee u weer net zoveel toernooien kunt aanmaken als u wilt)
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <table width="700">
          <tr>
            <td height="70" align="center" bgcolor="#009900">
              <form name="akkoord" method="post" action="Account_delete02.php">
                <input type="submit" class="submit-button" value="Account verwijderen !" style="width:220px; height:60px; background-color:#F00; color:#FFF; font-size:16px;"
                  title="Kies: account verwijderen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
            <td height="70" align="center" bgcolor="#009900">
              <form name="cancel" method="post" action="Toernooi_start.php">
                <input type="submit" class="submit-button" value="Niet verwijderen: terug" style="width:220px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
                  title="Terug" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </form>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="2" align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>