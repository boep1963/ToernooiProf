<?php
//© Hans Eekels, versie 02-12-2025
//Contact: vraag, suggestie, foutmelding verzenden, terug naar ClubMatch_start
//email afzender toegevoegd
//Logo refresh
$Path = '../../../data/connectie_clubmatch.php';
require_once('PHP/Functies_biljarten.php');

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(3) { 
["onderwerp"]=> string(1) "1" 
["bericht"]=> string(122) "Wat staat er nog op stapel qua nieuwe programma's van SpecialSoftware en wie heeft nu de leiding daar? Tevens /OR name="1"" 
["user_code"]=> string(10) "1002_CRJ@#" 
["email" => string() "hanseekels@gmail.com"}
*/
$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

if (isset($_POST['user_code'])) {
  $Code = $_POST['user_code'];
  if (strlen($Code) != 10) {
    $bAkkoord = FALSE;
  } else {
    if (fun_bestaatorg($Code, $Path) == FALSE) {
      $bAkkoord = FALSE;
    } else {
      $Org_nr = substr($Code, 0, 4);
      $Org_naam = fun_orgnaam($Org_nr, $Path);
      $Logo_naam = "Beheer/uploads/Logo_" . $Org_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (isset($_POST['onderwerp'])) {
  $Nr_onderwerp = $_POST['onderwerp'];
  if (filter_var($Nr_onderwerp, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  } else {
    if ($Nr_onderwerp == 1) {
      $Onderwerp = "Vraag";
    }
    if ($Nr_onderwerp == 2) {
      $Onderwerp = "Suggestie";
    }
    if ($Nr_onderwerp == 3) {
      $Onderwerp = "Fout-melding";
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (isset($_POST['bericht'])) {
  $Hulp_1 = $_POST['bericht'];
  $Bericht = fun_test_input($Hulp_1);
} else {
  $bAkkoord = FALSE;
}

if (isset($_POST['email'])) {
  $Email = $_POST['email'];

  if (!filter_var($Email, FILTER_VALIDATE_EMAIL)) {
    $bAkkoord = FALSE;
  } else {
    $Bericht = $Bericht . " Van: " . $Email;
  }
} else {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>ClubMatch</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ClubMatch" />
    <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
    <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="PHP/script_competitie.js" defer></script>
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
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
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
          <form name="cancel" method="post" action="../Start.php">
            <input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

//email zenden
$subject = $Onderwerp . " ClubMatch Org_nr: " . $Org_nr;
$headers = "From: info@specialsoftware.nl";
// send email
mail("hanseekels@gmail.com", $subject, $Bericht, $headers);

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>ClubMatch</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_competitie.js" defer></script>
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
      <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
      <td width="340" align="center" valign="middle" bgcolor="#003300">
        <h1>Melding !</h1>
      </td>
    </tr>
    <tr>
      <td height="50" colspan="2" align="center">
        <div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
          Contact-formulier verzonden !
        </div>
      </td>
    </tr>
    <tr>
      <td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
        <form name="cancel" method="post" action="ClubMatch_start.php">
          <input type="submit" class="submit-button" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
            title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>