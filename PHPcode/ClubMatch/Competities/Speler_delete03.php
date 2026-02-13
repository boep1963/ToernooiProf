<?php
//© Hans Eekels, versie 02-12-2025
//Speler definitief verwijderen
//ook uit partijen en hulprecords scoreborden
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

//var_dump($_POST) geeft:
//array(3) { ["user_code"]=> string(10) "1002_CRJ@#" ["comp_nr"]=> string(1) "1" ["speler"]=> string(1) "9" }
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

if (!isset($_POST['speler'])) {
  $bAkkoord = FALSE;
} else {
  $Speler_nr = $_POST['speler'];
  if (filter_var($Speler_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  } else {
    $Periode = fun_periode($Comp_nr, $Org_nr, $Path);
    $Speler_naam = fun_spelersnaam_competitie($Speler_nr, $Org_nr, $Comp_nr, $Periode, 1, $Path);
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

//verwijderen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //speler
  $sql = "DELETE FROM bj_spelers_comp WHERE spc_org = '$Org_nr' AND spc_nummer = '$Speler_nr' AND spc_competitie = '$Comp_nr'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  //uitslagen
  $sql = "DELETE FROM bj_uitslagen 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (sp_1_nr = '$Speler_nr' OR sp_2_nr = '$Speler_nr')";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  //in partijen
  $sql = "DELETE FROM bj_partijen
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (nummer_A = '$Speler_nr' OR nummer_B = '$Speler_nr')";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  //in scoreborden
  $sql = "SELECT uitslag_code FROM bj_uitslag_hulp WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $bGevonden = FALSE;
  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $Uitslag_code = $resultaat['uitslag_code'];    //1_009_012
    $A = substr($Uitslag_code, 2, 3);
    $B = substr($Uitslag_code, 6, 3);
    if (intval($A) == $Speler_nr || intval($B) == $Speler_nr) {
      $bGevonden = TRUE;
      break;
    }
  }
  if ($bGevonden == TRUE) {
    $sql = "DELETE FROM bj_uitslagen_hulp
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$Uitslag_code'";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }

  $sql = "SELECT uitslag_code FROM bj_uitslag_hulp_tablet WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $bGevonden = FALSE;
  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $Uitslag_code = $resultaat['uitslag_code'];    //1_009_012
    $A = substr($Uitslag_code, 2, 3);
    $B = substr($Uitslag_code, 6, 3);
    if (intval($A) == $Speler_nr || intval($B) == $Speler_nr) {
      $bGevonden = TRUE;
      break;
    }
  }
  if ($bGevonden == TRUE) {
    $sql = "DELETE FROM bj_uitslagen_hulp_tablet
			WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND uitslag_code = '$Uitslag_code'";

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
        <h2>Speler verwijderd</h2>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
          <?php print("Speler $Speler_naam en bijbehorende uitslagen verwijderd."); ?>
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
        <form name="partijen" method="post" action="Competitie_beheer.php">
          <input type="submit" class="submit-button" value="Naar Beheer" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
            title="Naar Beheersscherm" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
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