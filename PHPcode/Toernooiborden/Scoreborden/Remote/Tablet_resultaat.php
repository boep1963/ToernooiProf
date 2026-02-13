<?php
//© Hans Eekels, versie 10-11-2025
//Tablet_resultaat

require_once('../../../../../data/connectie_toernooiprof.php');
$Path = '../../../../../data/connectie_toernooiprof.php';
require_once('../../../ToernooiProf/PHP/Functies_toernooi.php');
$Punten = array();

/*
var_dump($_POST) geeft:
array(5) { 
["user_code"]=> string(10) "1024_AHS@#" 
["toernooi_nr"]=> string(1) "1" 
["tafel_nr"]=> string(1) "4" 
["u_code"]=> string(4) "4_1 " 
["poule_nr"]=> string(1) "1" }
*/

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

//check
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
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['toernooi_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Toernooi_nr = $_POST['toernooi_nr'];
  $Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['tafel_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Tafel_nr = $_POST['tafel_nr'];
  if ($Tafel_nr > 0) {
    if (filter_var($Tafel_nr, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  }
}

if (!isset($_POST['u_code'])) {
  $bAkkoord = FALSE;
} else {
  $Code_hulp = $_POST['u_code'];
  $U_code = str_replace(" ", "", $Code_hulp);
}

if (!isset($_POST['poule_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Poule_nr = $_POST['poule_nr'];
  if ($Poule_nr_nr > 0) {
    if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  }
}

if (count($_POST) != 5) {
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

//verder
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);

try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //namen spelers
  $sql = "SELECT * FROM tp_uitslagen
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_poule = '$Poule_nr' AND t_ronde = '$Huidige_ronde' AND sp_partcode = '$U_code'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $Sp1 = $resultaat['sp_nummer_1'];
    $Sp_A_naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp1, $Path);

    $Sp2 = $resultaat['sp_nummer_2'];
    $Sp_B_naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Sp2, $Path);
  }

  //rest
  $sql = "SELECT * FROM tp_uitslag_hulp_tablet 
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND t_ronde = '$Huidige_ronde' AND poule_nr = '$Poule_nr' AND uitslag_code = '$U_code' 
	AND tafel_nr = '$Tafel_nr' ORDER BY brt DESC limit 1";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $Beurten = $resultaat['brt'];
    $Car_A_gem = $resultaat["car_A_gem"];
    $Sp_A_car = $resultaat['car_A_tem'];
    $Car_B_gem = $resultaat["car_B_gem"];
    $Sp_B_car = $resultaat['car_B_tem'];
    $Hs_A = $resultaat["hs_A"];
    $Hs_B = $resultaat["hs_B"];
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//resultaat berekenen
if ($Beurten > 0) {
  $Moy_A = number_format(floor($Car_A_gem / $Beurten * 1000) / 1000, 3);
  $Moy_B = number_format(floor($Car_B_gem / $Beurten * 1000) / 1000, 3);
} else {
  $Moy_A = 0;
  $Moy_B = 0;
}
$sp_1_percar = floor($Car_A_gem / $Sp_A_car * 10000) / 100;
$sp_2_percar = floor($Car_B_gem / $Sp_B_car * 10000) / 100;

//punten bepalen
$Punten = fun_punten($Gebruiker_nr, $Toernooi_nr, $Sp_A_car, $Car_A_gem, $Sp_B_car, $Car_B_gem, $Path);
$Sp_A_punten = $Punten[1];
$Sp_B_punten = $Punten[2];

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
	<?php
	if ($Gebruiker_nr == 1024) {
		echo '<link rel="stylesheet" href="Media_1024.css">';
	} else {
		echo '<link rel="stylesheet" href="Media.css">';
	}
	?>
  <title>Uitslag</title>
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
  <table style="width:100%;" border="0" bgcolor="#000000">
    <tr>
      <td height="10" align="center" style="width:50%;"></td>
      <td align="center" style="width:10%;"></td>
      <td align="center" style="width:10%;"></td>
      <td align="center" style="width:10%;"></td>
      <td align="center" style="width:10%;"></td>
      <td align="center" style="width:10%;"></td>
    </tr>
    <tr>
      <td align="center" colspan="6">
        <h1>Eind uitslag</h1>
      </td>
    </tr>

    <tr>
      <td align="center" bgcolor="#999999">
        <h1>Naam</h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1>Car</h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1>Brt</h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1>Moy</h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1>HS</h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1>Pnt</h1>
      </td>
    </tr>
    <tr>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Sp_A_naam"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Car_A_gem"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Beurten"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Moy_A"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Hs_A"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Sp_A_punten"); ?></h1>
      </td>
    </tr>
    <tr>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Sp_B_naam"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Car_B_gem"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Beurten"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Moy_B"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Hs_B"); ?></h1>
      </td>
      <td align="center" bgcolor="#999999">
        <h1><?php print("$Sp_B_punten"); ?></h1>
      </td>
    </tr>
    <tr>
      <td align="center" bgcolor="#000000">
        <form name="akkoord" method="post" action="Tablet_opslaan.php">
          <input type="submit" class="cancel-button" style="background-color:#060;" value="Akkoord" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
          <input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
          <input type="hidden" name="car_A_gem" value="<?php print("$Car_A_gem"); ?>">
          <input type="hidden" name="hs_A" value="<?php print("$Hs_A"); ?>">
          <input type="hidden" name="punten_A" value="<?php print("$Sp_A_punten"); ?>">
          <input type="hidden" name="brt" value="<?php print("$Beurten"); ?>">
          <input type="hidden" name="car_B_gem" value="<?php print("$Car_B_gem"); ?>">
          <input type="hidden" name="hs_B" value="<?php print("$Hs_B"); ?>">
          <input type="hidden" name="punten_B" value="<?php print("$Sp_B_punten"); ?>">
        </form>
      </td>
      <td colspan="5" align="center" bgcolor="#000000">
        <form name="cancel" method="post" action="Tablet_terug.php">
          <input type="submit" class="cancel-button" style="background-color:#F00;" value="Niet Akkoord" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="u_code" value="<?php print("$U_code"); ?> ">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="poule_nr" value="<?php print("$Poule_nr"); ?>">
          <input type="hidden" name="tafel_nr" value="<?php print("$Tafel_nr"); ?>">
          <input type="hidden" name="car_A_tem" value="<?php print("$Sp_A_car"); ?>">
          <input type="hidden" name="car_B_tem" value="<?php print("$Sp_B_car"); ?>">
        </form>
      </td>
    </tr>
  </table>
</body>

</html>