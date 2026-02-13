<?php
//© Hans Eekels, versie 10-11-2025
//Toont wachtrij voor tablet voor gekozen tafel
//NBL er is al gechecked dat alleen de tafels die bedoeld zijn voor een tablet getoond worden
//Toon geen partijen die nu bezig zijn (op deze tafel bezig is status=1 of 2 in bj_tafel, of op een andere tafel bezig is, staan in bj_uitslag_hulp
//refresh aangepast 12-07-2025
require_once('../../../../../data/connectie_clubmatch.php');
$Path = '../../../../../data/connectie_clubmatch.php';
require_once('../../../ClubMatch/PHP/Functies_biljarten.php');

/*
var_dump($_POST) geeft:
array(3) { ["tafel_04"]=> string(0) "" } ["user_code"]=> string(10) "1002_CRJ@#" ["comp_nr"]=> string(1) "1" }
*/

$Partijen_hulp = array();      //alle aangemaakte partijen incl die bezig zijn
$Partijen = array();        //alle partijen excl die al bezig zijn

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

//check
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
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['comp_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Comp_nr = $_POST['comp_nr'];
  $Comp_naam = fun_competitienaam($Org_nr, $Comp_nr, 1, $Path);
  if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

foreach ($_POST as $key_var => $value_var) {
  if (substr($key_var, 0, 6) == "tafel_") {
    $Tafel_nr = intval(substr($key_var, 6, 2));
    $Tafel_naam = "tafel_" . substr($key_var, 6, 2);  //voor naam hidden text
  }
}

if (count($_POST) != 3) {
  $bAkkoord = FALSE;
}

//check
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

//verder
$Aantal_tafels = fun_aantaltafels($Code, $Path);

//wanneer laten we wat zien:
//	als er nu geen partij wordt gespeeld op deze tafel (dan is er een record bj_tafel met dit tafel_nr)
//wat laten we zien:
//	partijen met o.a. dit tafel-nummer, die nog niet zijn gestart op een ander tafel

//eerst: check of er een partij bezig is op deze tafel, zo ja dan geen partijen laten zien. 
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "SELECT * FROM bj_tafel WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND tafel_nr = '$Tafel_nr' AND status > '0'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) == 0) {
    $bTonen = TRUE;
  } else {
    $bTonen = FALSE;
    $Aantal_partijen = 0;
  }

  if ($bTonen == TRUE) {
    $sql = "SELECT * FROM bj_partijen 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND gespeeld = '0' ORDER BY part_id DESC";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }

    if (mysqli_num_rows($res) > 0) {
      $teller = 0;
      while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
        $Tafel_string = $resultaat['tafel'];
        if (fun_tafel_nummers($Tafel_string, $Aantal_tafels, $Tafel_nr, 2) == 1) {
          $teller++;
          $SpA = $resultaat['nummer_A'];
          $Partijen_hulp[$teller]['naam_A'] = fun_spelersnaam_competitie($SpA, $Org_nr, $Comp_nr, $Periode, 1, $Path);
          $SpB = $resultaat['nummer_B'];
          $Partijen_hulp[$teller]['naam_B'] = fun_spelersnaam_competitie($SpB, $Org_nr, $Comp_nr, $Periode, 1, $Path);
          $Partijen_hulp[$teller]['uitslag_code'] = $resultaat['uitslag_code'];
        }
      }

      $Aantal_partijen_hulp = $teller;

      //nu check op partijen die al gestart zijn op andere tafels
      //dat kunnen zowel tablet-tafels als muis-tafels zijn, dus dan is er een record in bj_tafels met deze u-code
      //of een record in bj_uitslag_hulp
      $teller = 0;
      for ($a = 1; $a < $Aantal_partijen_hulp + 1; $a++) {
        $U_code_hulp = $Partijen_hulp[$a]['uitslag_code'];
        $sql = "SELECT * FROM bj_tafel WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND u_code = '$U_code_hulp'";

        $res = mysqli_query($dbh, $sql);
        if (!$res) {
          throw new Exception(mysqli_error($dbh));
        }

        if (mysqli_num_rows($res) == 0) {
          //nu kijken in bj_uitslag_hulp
          $sql = "SELECT * FROM bj_uitslag_hulp WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$U_code_hulp'";

          $res = mysqli_query($dbh, $sql);
          if (!$res) {
            throw new Exception(mysqli_error($dbh));
          }

          if (mysqli_num_rows($res) == 0) {
            $teller++;
            $Partijen[$teller]['naam_A'] = $Partijen_hulp[$a]['naam_A'];
            $Partijen[$teller]['naam_B'] = $Partijen_hulp[$a]['naam_B'];
            $Partijen[$teller]['uitslag_code'] = $Partijen_hulp[$a]['uitslag_code'];
          }
        }
      }
      $Aantal_partijen = $teller;
    } else {
      $Aantal_partijen = 0;
    }
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Partij kiezen</title>
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
  <form name="wedstrijden" method="post" action="Tablet_bediening.php">
    <table style="width:100%;" border="0">
      <tr>
        <td colspan="4" align="center" bgcolor="#003300">
          <h2><?php print("$Comp_naam Tafel nr: $Tafel_nr"); ?></h2>
        </td>
      </tr>
      <tr>
        <td style="width:10%;" align="center" bgcolor="#003300">
          <img src="../Pijl.jpg" class="slot-afbeelding" alt="Kies">
        </td>
        <td style="width:44%;" align="center" bgcolor="#003300">
          <h1>Speler A</h1>
        </td>
        <td style="width:2%;" align="center" bgcolor="#003300">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          <input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
        </td>
        <td style="width:44%;" align="center" bgcolor="#003300">
          <h1>Speler B</h1>
        </td>
      </tr>
      <?php
      if ($Aantal_partijen == 0) {
      ?>
        <tr>
          <td colspan="4" align="center" valign="middle">
            <h2>(Nog) geen partijen beschikbaar</h2>
          </td>
        </tr>
        <?php
      } else {
        for ($a = 1; $a < $Aantal_partijen + 1; $a++) {
          $Naam_A = $Partijen[$a]['naam_A'];
          $Naam_B = $Partijen[$a]['naam_B'];
          $U_code = $Partijen[$a]['uitslag_code'];
        ?>
          <tr>
            <td align="center" valign="middle">
              <input type="submit" class="wissel-button" name="u_code" style="background-color:#FF0; color:#FF0;"
                value="<?php print("$U_code"); ?>" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            </td>
            <td align="center" valign="middle">
              <h1><?php print("$Naam_A"); ?></h1>
            </td>
            <td align="center" valign="middle">&nbsp;</td>
            <td align="center" valign="middle">
              <h1><?php print("$Naam_B"); ?></h1>
            </td>
          </tr>
      <?php
        }
      }
      ?>
      <tr>
        <td colspan="4" height="1">&nbsp;</td>
      </tr>
    </table>
  </form>
  <form name="refresh" method="post" action="Tablet_toon_tafel.php">
    <table style="width:100%;" border="0">
      <tr>
        <td align="center" bgcolor="#003300">
          <input type="submit" class="cancel-button" value="Refresh" title="Vernieuw pagina" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          <input type="hidden" name="<?php print("$Tafel_naam"); ?>" value="<?php print("$Tafel_nr"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Tablet_keuze_tafel.php">
    <table style="width:100%;" border="0">
      <tr>
        <td style="width:50%;" align="center" bgcolor="#003300">
          <input type="submit" class="cancel-button" value="Cancel" title="Terug naar beheer" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </td>
      </tr>
    </table>
  </form>
</body>

</html>