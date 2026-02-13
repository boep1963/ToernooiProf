<?php
//© Hans Eekels, versie 10-11-2025
//Tablet keuze competitie na check code

require_once('../../../../../data/connectie_toernooiprof.php');
$Path = '../../../../../data/connectie_toernooiprof.php';
require_once('../../../ToernooiProf/PHP/Functies_toernooi.php');

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

  if ($Nummer_3 * 322057 == $Nummer_4) {
    //klopt
    $Code = "1024_AHS@#";
  }

  return $Code;
}
$Copy = Date("Y");
$Toernooien = array();


//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1002_CRJ@#" }
//of vanuit OnderOns ["token_tp"] met 7_2_1790068

$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

if (isset($_POST['token_tp'])) {
  $Nummer_totaal = $_POST['token_tp'];
  $Code = fun_tokenparse($Nummer_totaal);
  if (strlen($Code) != 10) {
    $bAkkoord = FALSE;
  } else {
    $Gebruiker_naam = fun_testgebruiker($Code, $Path);
    if ($Gebruiker_naam == '9999') {
      $bAkkoord = FALSE;
    } else {
      $Gebruiker_nr = substr($Code, 0, 4);
    }
  }
}

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
    <title>ToernooiProf</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ToernooiProf" />
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

//pagina met keuze toernooien als die er zijn
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //spelers
  $sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' ORDER BY t_nummer DESC";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) == 0) {
    $Aantal_toernooien = 0;
  } else {
    $teller = 0;
    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $teller++;
      $Toernooien[$teller]['t_nummer'] = $resultaat['t_nummer'];
      $Toernooien[$teller]['t_naam'] = $resultaat['t_naam'];
      $Toernooien[$teller]['t_datum'] = $resultaat['t_datum'];
    }
    $Aantal_toernooien = $teller;
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

if ($Aantal_toernooien == 0) {
  $error_message = "Bij $Gebruiker_naam zijn geen toernooien gevonden !<br>U keert terug naar de inlog-pagina.";
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>ToernooiProf</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ToernooiProf" />
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
    <title>ToernooiProf</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ToernooiProfh" />
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
            <h1>Kies toernooi</h1>
          </td>
        </tr>
        <tr>
          <td height="50" align="center">
            <select name="toernooi_nr" style="font-size:24px">
              <?php
              for ($a = 1; $a < $Aantal_toernooien + 1; $a++) {
                $Num = $Toernooien[$a]['t_nummer'];
                $Nm = $Toernooien[$a]['t_naam'];
                $Dt = $Toernooien[$a]['t_datum'];
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
            <input type="submit" class="wissel-button" value="Kies" title="Kies toernooi"
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