<?php
//© Hans Eekels, versie 02-12-2025
//Uitslag verwijderen, stap 1: kies speler in periode
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Spelers = array();

//var_dump($_POST) geeft: array(2) { ["comp_nr"]=> string(1) "1" ["user_code"]=> string(10) "1002_CRJ@#" }

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

if (count($_POST) != 2) {
  $bAkkoord = FALSE;
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

//verder
$Periode_nu = fun_periode($Comp_nr, $Org_nr, $Path);
$Aantal_perioden = $Periode_nu;

//spelers opvragen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  //spelers
  $sql = "SELECT * FROM bj_spelers_comp WHERE spc_org = '$Org_nr' AND spc_competitie = '$Comp_nr'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $teller = 0;
  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $teller++;
    $Nr = $resultaat['spc_nummer'];
    $Spelers[$teller]['spc_naam'] = fun_spelersnaam_competitie($Nr, $Org_nr, $Comp_nr, $Periode_nu, 1, $Path);    //excl car
    $Spelers[$teller]['spc_nummer'] = $Nr;
  }

  $Aantal_spelers = $teller;
  sort($Spelers);    //keystart = 0 !

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
  <title>Uitslag verwijderen</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_competitie.js" defer></script>
  <style type="text/css">
    body {
      width: 600px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <form name="uitslag" method="post" action="Uitslag_delete03.php">
    <table width="600" border="0">
      <tr>
        <td width="170" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="170" height="85" alt="Logo"></td>
        <td colspan="2" align="center" valign="middle" bgcolor="#009900" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td colspan="3" align="center" bgcolor="#009900" class="grootwit"><strong><?php print("$Comp_naam"); ?></strong></td>
      </tr>
      <tr>
        <td height="20" colspan="3" align="center" bgcolor="#009900">
          <div style="margin:10px; font-size:16px">
            <h2>Uitslag verwijderen</h2>
            NB: bij een partij tussen A en B maakt het niet uit<br>
            of u eerst speler A kiest of eerst speler B.
          </div>
        </td>
      </tr>
      <tr>
        <td width="170" height="40" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Kies periode</strong></td>
        <td width="220" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Kies Speler A</strong></td>
        <td align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Kies Speler B</strong></td>
      </tr>
      <tr>
        <td height="40" width="150" align="center" valign="middle" bgcolor="#009900" class="grootwit">
          <select name="periode_keuze" style="font-size:16px;">
            <?php
            for ($a = 1; $a < $Aantal_perioden + 1; $a++) {
              $Per_naam = "Periode_" . $a;
              if ($a == $Periode_nu) {
            ?>
                <option value="<?php print("$a"); ?>" selected><?php print("$Per_naam"); ?></option>
              <?php
              } else {
              ?>
                <option value="<?php print("$a"); ?>"><?php print("$Per_naam"); ?></option>
            <?php
              }
            }
            ?>
          </select>
        </td>
        <td align="center" valign="middle" bgcolor="#009900" class="grootwit">
          <?php
          if ($Aantal_spelers == 0) {
            print("Geen spelers om in te voeren");
          } else {
          ?>
            <select name="speler_A" style="font-size:16px;">
              <?php
              for ($a = 0; $a < $Aantal_spelers; $a++) {
                $Num = $Spelers[$a]['spc_nummer'];
                $Naam = $Spelers[$a]['spc_naam'];
              ?>
                <option value="<?php print("$Num"); ?>"><?php print("$Naam"); ?></option>
              <?php
              }
              ?>
            </select>
          <?php
          }
          ?>
        </td>
        <td align="center" width="218" bgcolor="#009900">
          <?php
          if ($Aantal_spelers == 0) {
            print("Geen spelers om in te voeren");
          } else {
          ?>
            <select name="speler_B" style="font-size:16px;">
              <?php
              for ($a = 0; $a < $Aantal_spelers; $a++) {
                $Num = $Spelers[$a]['spc_nummer'];
                $Naam = $Spelers[$a]['spc_naam'];
              ?>
                <option value="<?php print("$Num"); ?>"><?php print("$Naam"); ?></option>
              <?php
              }
              ?>
            </select>
          <?php
          }
          ?>
        </td>
      </tr>
      <tr>
        <td colspan="3" height="40" align="center" valign="middle" bgcolor="#009900">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
      <tr>
        <td height="40" colspan="3" align="center" valign="middle" bgcolor="#009900">
          <input type="submit" class="submit-button" value="Naar uitslag" style="width:200px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
            title="Stap 2: naar uitslag" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="3">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Competitie_beheer.php">
    <table width="600" border="0">
      <tr>
        <td height="40" width="297" align="left" bgcolor="#009900">&nbsp;
          <input type="submit" class="submit-button" style="width:120px; height:30px;" title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td width="297" align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>