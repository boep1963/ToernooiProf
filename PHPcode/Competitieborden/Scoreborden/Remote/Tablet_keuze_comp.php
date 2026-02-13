<?php
//© Hans Eekels, versie 10-11-2025
//Tablet keuze competitie na check code
require_once('../../../../../data/connectie_clubmatch.php');
$Path = '../../../../../data/connectie_clubmatch.php';
require_once('../../../ClubMatch/PHP/Functies_biljarten.php');

function fun_tokenparse($Nummer_totaal)
{
  //initialiseren
  $Code = "0";

  $Num_hulp = $Nummer_totaal;
  $Nummer_1 = intval(substr($Nummer_totaal, 0, 1));
  $Nummer_2 = intval(substr($Nummer_totaal, 2, 1));
  $Nummer_3 = $Nummer_1 * $Nummer_2;
  $Lengte = strlen($Nummer_totaal);
  $Nummer_4 = intval(substr($Nummer_totaal, 4, $Lengte - 4));

  if ($Nummer_3 * 127862 == $Nummer_4) {
    //klopt
    $Code = "1078_FLG@#";
  }

  return $Code;
}

$Copy = Date("Y");

//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1002_CRJ@#" }
//of vanuit OnderOns ["token_cm"] met 7_2_1790068


$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

if (isset($_POST['token_cm'])) {
  $Nummer_totaal = $_POST['token_cm'];
  $Code = fun_tokenparse($Nummer_totaal);
  if (strlen($Code) != 10) {
    $bAkkoord = FALSE;
  } else {
    if (fun_bestaatorg($Code, $Path) == FALSE) {
      $bAkkoord = FALSE;
    } else {
      $Org_nr = substr($Code, 0, 4);
      $Org_naam = fun_orgnaam($Org_nr, $Path);
    }
  }
}

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
    }
  }
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
    <title>ClubMatch</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ClubMatch" />
    <link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
    <style type="text/css">
      body {
        width: 500px;
        background-color: #000;
        margin-top: 100px;
        margin-left: auto;
        margin-right: auto;
        font-family: Verdana, Geneva, sans-serif;
        font-size: 16px;
        color: #FFF;
      }

      h1 {
        font-size: 18px;
        color: #FFF;
      }

      .button:hover {
        border-color: #FFF;
      }
    </style>
    <script>
      function mouseInBut(event) {
        var button = event.target || event.srcElement;
        button.style.borderColor = "#F00";
      }

      function mouseOutBut(event) {
        var button = event.target || event.srcElement;
        button.style.borderColor = "transparent";
      }
    </script>
  </head>

  <body>
    <table width="500" border="0">
      <tr>
        <td align="center" valign="middle" bgcolor="#003300">
          <h1>Foutmelding !</h1>
        </td>
      </tr>
      <tr>
        <td height="50" align="center">
          <div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
            <?php print($error_message); ?>
          </div>
        </td>
      </tr>
      <tr>
        <td height="60" align="center" valign="middle" bgcolor="#003300">
          <form name="cancel" method="post" action="Tablet_inloggen.php">
            <input type="submit" class="submit-button" value="Terug" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Terug naar inloggen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="20" align="right" bgcolor="#003300">&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

//pagina met keuze competities als die er zijn
//competities opvragen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //spelers
  $sql = "SELECT * FROM bj_competities WHERE org_nummer = '$Org_nr' AND vast_beurten = '0' ORDER BY comp_nr DESC";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) == 0) {
    $Aantal_competities = 0;
  } else {
    $teller = 0;
    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $teller++;
      $Competities[$teller]['comp_nr'] = $resultaat['comp_nr'];
      $Competities[$teller]['comp_naam'] = $resultaat['comp_naam'];
      $Competities[$teller]['comp_datum'] = $resultaat['comp_datum'];
    }
    $Aantal_competities = $teller;
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

if ($Aantal_competities == 0) {
  $error_message = "Bij $Org_naam zijn geen competities gevonden !<br>U keert terug naar de inlog-pagina.";
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClubMatch</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ClubMatch" />
    <link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
    <style type="text/css">
      body {
        width: 500px;
        background-color: #000;
        margin-top: 100px;
        margin-left: auto;
        margin-right: auto;
        font-family: Verdana, Geneva, sans-serif;
        font-size: 16px;
        color: #FFF;
      }

      h1 {
        font-size: 18px;
        color: #FFF;
      }

      .button:hover {
        border-color: #FFF;
      }
    </style>
    <script>
      function mouseInBut(event) {
        var button = event.target || event.srcElement;
        button.style.borderColor = "#F00";
      }

      function mouseOutBut(event) {
        var button = event.target || event.srcElement;
        button.style.borderColor = "transparent";
      }
    </script>
  </head>

  <body>
    <table style="width:100%;" border="0">
      <tr>
        <td align="center" valign="middle" bgcolor="#003300">
          <h1>Foutmelding !</h1>
        </td>
      </tr>
      <tr>
        <td height="50" align="center">
          <div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
            <?php print($error_message); ?>
          </div>
        </td>
      </tr>
      <tr>
        <td align="center" valign="middle" bgcolor="#003300">
          <form name="cancel" method="post" action="Tablet_inloggen.php">
            <input type="submit" class="submit-button" value="Terug"
              title="Terug naar inloggen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
} else {
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClubMatch</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ClubMatch" />
    <link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
    <?php
	if ($Gebruiker_nr == 1024) {
		echo '<link rel="stylesheet" href="Media_1024.css">';
	} else {
		echo '<link rel="stylesheet" href="Media.css">';
	}
	?>
    <script>
      function mouseInBut(event) {
        var button = event.target || event.srcElement;
        button.style.borderColor = "#F00";
      }

      function mouseOutBut(event) {
        var button = event.target || event.srcElement;
        button.style.borderColor = "transparent";
      }
    </script>
  </head>

  <body>
    <form name="competities" method="post" action="Tablet_keuze_tafel.php">
      <table style="width:100%;" border="0">
        <tr>
          <td align="center" valign="middle" bgcolor="#003300">
            <h1>Kies competitie</h1>
          </td>
        </tr>
        <tr>
          <td height="50" align="center">
            <select name="comp_nr" style="font-size:24px">
              <?php
              for ($a = 1; $a < $Aantal_competities + 1; $a++) {
                $Num = $Competities[$a]['comp_nr'];
                $Nm = $Competities[$a]['comp_naam'];
                $Dt = $Competities[$a]['comp_datum'];
                $Naam = $Nm . " (" . $Dt . ")";
              ?>
                <option value="<?php print("$Num"); ?>"><?php print("$Naam"); ?></option>
              <?php
              }
              ?>
            </select>
          </td>
        </tr>
        <tr>
          <td align="center" valign="middle" bgcolor="#003300">
            <input type="submit" class="wissel-button" value="Kies" title="Kies competitie"
              onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          </td>
        </tr>
        <tr>
          <td align="left" bgcolor="#003300">
            <input type="button" class="cancel-button" onClick="location='Tablet_inloggen.php'" value="Cancel" title="Terug naar inloggen"
              onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </td>
        </tr>
      </table>
    </form>
  </body>

  </html>
<?php
}
?>