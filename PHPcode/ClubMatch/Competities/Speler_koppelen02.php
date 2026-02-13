<?php
//© Hans Eekels, versie 02-12-2025
//Gekoppelde Speler(s) opslaan
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(6) { 
[11]=> string(2) "11" spelers met key en var het spelernummer; NB bij geen nummer 0 spelers gekoppeld
[1]=> string(1) "1" 
[7]=> string(1) "7" 
[10]=> string(2) "10" 

["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }
*/

$Spelers = array();
$Moy_dis = array();

$Copy = Date("Y");

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

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
      $Logo_naam = "../Beheer/uploads/Logo_" . $Org_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
      }
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

if ($bAkkoord == FALSE) {
  $Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";

  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>ClubMatch</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ClubMatch" />
    <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
    <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../PHP/script_competitie.js" defer></script>
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
          <form name="cancel" method="post" action="../../Start.php">
            <input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&nbsp;&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

$teller = 0;
foreach ($_POST as $key_var => $value_var) {
  if ($key_var != "comp_nr") {
    if ($key_var != "user_code") {
      $teller++;
      $Spelers[$teller]['spc_nummer'] = intval($value_var);
      $Spelers[$teller]['spc_moy'] = 0;  //hierna vullen
      $Spelers[$teller]['spc_car'] = 0;  //hierna vullen
    }
  }
}

$Aantal_spelers = $teller;

if ($Aantal_spelers == 0) {
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>ClubMatch</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ClubMatch" />
    <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
    <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../PHP/script_competitie.js" defer></script>
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
        <td align="center" valign="middle" bgcolor="#003300">
          <h1>ClubMatch</h1>
        </td>
      </tr>
      <tr>
        <td align="center" colspan="2">
          <h1>Melding</h1>
        </td>
      </tr>
      <tr>
        <td colspan="2" class="grootwit">
          <div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
            U heeft geen spelers aangevinkt om te koppelen !<br>
            U keert terug naar Beheer.
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
          <form name="partijen" method="post" action="Competitie_beheer.php">
            <input type="submit" class="submit-button" value="Naar Beheer" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar Startscherm" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
            <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          </form>
        </td>
      </tr>
      <tr>
        <td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  <script>
	var logoPath = '<?php echo $Logo_naam; ?>';
	window.onload = function() {
		verversLogo(logoPath);
		
		function verversLogo(pad) {
		var logo = document.getElementById('logoAfbeelding');
		var basisSrc = pad.split('?')[0];
		var timestamp = new Date().getTime();
		var nieuweSrc = basisSrc + '?' + timestamp;
		logo.src = nieuweSrc;
		}
	};
	</script>
  </body>

  </html>
<?php
  exit;
}
//verder
//kolomnaam moyenne bij gegeven discipline in bj_spelers_algemeen
$Moy_dis = fun_nummoydis($Comp_nr, $Org_nr, $Path);
$Discipline = $Moy_dis['dis_nummer'];
$Kolom_naam = $Moy_dis['kolom_naam'];

//gegevens gekoppelde spelers ophalen uit bj_spelers_algemeen en opslaan in bj_spelers_comp met competitie $Comp_nr
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //data opzoeken in bj_spelers_algemeen
  for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
    $Nr = $Spelers[$a]['spc_nummer'];

    $sql = "SELECT * FROM bj_spelers_algemeen WHERE spa_org = '$Org_nr' AND spa_nummer = '$Nr'";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }

    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $Moy_hulp = $resultaat[$Kolom_naam];
      $Spelers[$a]['spc_moy'] = $Moy_hulp;
      $Spelers[$a]['spc_car'] = fun_car($Moy_hulp, $Comp_nr, $Org_nr, $Path);
    }
  }

  //invoeren
  for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
    $Nr = $Spelers[$a]['spc_nummer'];
    $Moy = $Spelers[$a]['spc_moy'];
    $Cr = $Spelers[$a]['spc_car'];

    //insert of niet bij al bestaan

    $sql = "INSERT INTO bj_spelers_comp 
				(spc_nummer, spc_org, spc_competitie, spc_moyenne_1, spc_car_1, spc_moyenne_2, spc_car_2, spc_moyenne_3, spc_car_3, spc_moyenne_4, spc_car_4, spc_moyenne_5, spc_car_5) 
				VALUES 
				('$Nr', '$Org_nr', '$Comp_nr', '$Moy', '$Cr', '$Moy', '$Cr', '$Moy', '$Cr', '$Moy', '$Cr', '$Moy', '$Cr')";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>ClubMatch</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_competitie.js" defer></script>
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
      <td align="center" valign="middle" bgcolor="#003300">
        <h1>ClubMatch</h1>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="2">
        <h1>Spelers gekoppeld</h1>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:16px">
          <?php
          if ($Aantal_spelers == 1) {
            print("De gekozen speler is aan deze competitie gekoppeld.");
          } else {
            print("De gekozen spelers zijn aan deze competitie gekoppeld.");
          }
          ?>
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
        <form name="partijen" method="post" action="Competitie_beheer.php">
          <input type="submit" class="submit-button" value="Naar Startscherm" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
            title="Naar Startscherm" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>