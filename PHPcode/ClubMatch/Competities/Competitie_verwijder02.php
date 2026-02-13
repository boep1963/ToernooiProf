<?php
//© Hans Eekels, versie 03-12-2025
//Competitie verwijderen waarschuwing
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

//var_dump($_POST) geeft:
//array(2) { ["comp_nr"]=> string(1) "2" ["user_code"]=> string(10) "1002_CRJ@#" }
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

if (isset($_POST['comp_nr'])) {
  $Comp_nr = $_POST['comp_nr'];
  if ($Comp_nr > 0) {
    if (filter_var($Comp_nr, FILTER_VALIDATE_INT) == FALSE) {
      $bAkkoord = FALSE;
    }
  } else {
    $bAkkoord = FALSE;
  }
} else {
  $bAkkoord = FALSE;
}

if (count($_POST) != 2) {
  $bAkkoord = FALSE;
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

try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "SELECT *  FROM bj_competities WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $Naam = $resultaat['comp_naam'];
    $Datum = $resultaat['comp_datum'];
    $Periode = $resultaat['periode'];
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//melding
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Competitie verwijderen</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_competitie.js" defer></script>
  <style type="text/css">
    body {
      width: 700px;
      margin-top: 0px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <table width="600" border="0">
    <tr>
      <td height="5" width="145" bordercolor="#000000">&nbsp;</td>
      <td width="145" bordercolor="#000000">&nbsp;</td>
      <td width="145" bordercolor="#000000">&nbsp;</td>
      <td bordercolor="#000000">&nbsp;</td>
    <tr>
    <tr>
      <td width="150" height="75" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo"></td>
      <td colspan="3" align="center" valign="middle" bgcolor="#009900" class="kop">
        ClubMatch Online<br>
        <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
      </td>
    </tr>
    <tr>
      <td colspan="4" align="center" valign="middle" bgcolor="#003300">
        <h2>Competitie verwijderen</h2>
      </td>
    </tr>
    <tr>
      <td height="100" colspan="4" bgcolor="#FF0000" class="grootwit">
        <div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px;">
          <strong>Waarschuwing !</strong><br><br>
          U staat op het punt de volgende competitie te verwijderen:<br>
          Naam: <?php print("$Naam"); ?><br>
          Datum: <?php print("$Datum"); ?><br>
          Periode: <?php print("$Periode"); ?><br><br>
          Een verwijdering kan niet meer ongedaan gemaakt worden !
        </div>
      </td>
    </tr>
    <tr>
      <td height="60" width="295" colspan="2" align="center" valign="middle" bgcolor="#003300">
        <form name="terug" method="post" action="../ClubMatch_start.php">
          <input type="submit" class="submit-button" value="Cancel" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
            title="Niet verwijderen !" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td width="295" colspan="2" align="center" valign="middle" bgcolor="#003300">
        <form name="akkoord" method="post" action="Competitie_verwijder03.php">
          <input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#F00; color:#FFF; font-size:24px;"
            title="Verwijderen akkoord !" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="30" colspan="4" align="right" bgcolor="#003300" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>