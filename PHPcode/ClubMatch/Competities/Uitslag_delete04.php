<?php
//© Hans Eekels, versie 02-12-2025
//Uitslag verwijderen en uit voorzorg: zelfde partij en scorebord-records verwijderen
//ook evt partij bj_tafel verwijderen en beide _hulp records (normaal en tablet)
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(4) { 
["comp_nr"]=> string(1) "1" 
["user_code"]=> string(10) "1002_CRJ@#" 
["uitslag_code"]=> string(9) "1_004_007" 
["periode_keuze"]=> string(1) "1" }
*/

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

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

if (!isset($_POST['uitslag_code'])) {
  $bAkkoord = FALSE;
} else {
  $Hulpje = $_POST['uitslag_code'];
  $Uitslag_code = str_replace(" ", "", $Hulpje);    //ev spaties eruit
  $Uitslag_code_2 = fun_invertcode($Uitslag_code);
}

if (!isset($_POST['periode_keuze'])) {
  $bAkkoord = FALSE;
} else {
  $Periode_keuze = intval($_POST['periode_keuze']);
  if ($Periode_keuze > 0) {
    if (filter_var($Periode_keuze, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  } else {
    $bAkkoord = FALSE;
  }
}

//check
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

  $sql = "DELETE FROM bj_uitslagen 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  //nu eventueel record in partijen en in uitslag_hulp verwijderen
  $sql = "DELETE FROM bj_partijen 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $sql = "DELETE FROM bj_uitslag_hulp 
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $sql = "DELETE FROM bj_uitslag_hulp_tablet
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (uitslag_code = '$Uitslag_code' OR uitslag_code = '$Uitslag_code_2')";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $sql = "DELETE FROM bj_tafel
		WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND (u_code = '$Uitslag_code' OR u_code = '$Uitslag_code_2')";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
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
        <h1>Uitslag verwijderd</h1>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
          Uitslag is verwijderd !<br><br>U keert terug naar de pagina Beheer.
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
        <form name="partijen" method="post" action="Competitie_beheer.php">
          <input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
            title="Naar uitslagen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="30" colspan="2" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>