<?php
//© Hans Eekels, versie 03-12-2025
//Competitie wijzigen
//Geen punten_sys wijzigen
//ook sorteren namen wijzigen
//Kop gewijzigd
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(2) { ["comp_nr"]=> string(1) "2" ["user_code"]=> string(10) "1002_CRJ@#" }
*/

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

//verder
//gegevens ophalen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //spelers
  $sql = "SELECT * FROM bj_competities WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  if (mysqli_num_rows($res) == 0) {
    $bAkkoord = FALSE;
  } else {
    $bAkkoord = TRUE;
    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $Naam = $resultaat['comp_naam'];
      $Datum = $resultaat['comp_datum'];
      $Sorteren = $resultaat['sorteren'];
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
  <title>Competitie wijzigen</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_competitie.js" defer></script>
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
  <form name="competitie" method="post" action="Competitie_wijzig03.php">
    <table width="700" border="0">
      <tr>
        <td width="170" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
        <td colspan="2" align="center" valign="middle" bgcolor="#009900" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td colspan="3" align="center" valign="middle" bgcolor="#009900">
          <h1>Competitie-gegevens wijzigen</h1>
        </td>
      </tr>
      <tr>
        <td colspan="3" align="center" valign="middle" bgcolor="#009900" class="grootwit">
          <div style="margin:10px;">
            U kunt van een aangemaakte competitie niet alle gegevens tussentijds wijzigen, maar wel de naam, de datum en de sorteer-volgorde.<br>
          </div>
        </td>
      </tr>
      <tr>
        <td height="45" width="198" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>&nbsp;Naam:</strong></td>
        <td align="left" width="368" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Naam" minlength="3" maxlength="30" size="25" title="Max 30 letters" required value="<?php print("$Naam"); ?>" autofocus tabindex="1" />
        </td>
        <td width="120" align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help1"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_naam.php','Help','width=420,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="45" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>&nbsp;Datum:</strong></td>
        <td align="left" valign="middle" bgcolor="#009900">
          <input type="text" onClick="this.select();" name="Datum" size="25" minlength="3" maxlength="30" title="Datum of seizoen" required value="<?php print("$Datum"); ?>" tabindex="2">
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help2"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_datum.php','Help','width=420,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="45" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>&nbsp;Namen sorteren:</strong></td>
        <td align="left" valign="middle" bgcolor="#009900">
          <select name="Sorteren" tabindex="9">
            <?php
            if ($Sorteren == 1) {
            ?>
              <option value="1" selected>Op voornaam</option>
              <option value="2">Op achternaam</option>
            <?php
            } else {
            ?>
              <option value="1">Op voornaam</option>
              <option value="2" selected>Op achternaam</option>
            <?php
            }
            ?>
          </select>
        </td>
        <td align="center" valign="middle" bgcolor="#009900">
          <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help2"
            value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            onClick="window.open('../Help/Help_sorteren.php','Help','width=420,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
        </td>
      </tr>
      <tr>
        <td height="45" colspan="3" align="center" valign="middle" bgcolor="#009900" class="klein">
          <input type="submit" class="submit-button" value="Opslaan" style="width:120px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
            title="Gegevens opslaan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="7">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="../ClubMatch_start.php">
    <table width="700">
      <tr>
        <td width="200" height="30" align="center" bgcolor="#009900">
          <input type="submit" class="submit-button" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="9">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>