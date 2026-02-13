<?php
//© Hans Eekels, versie 02-12-2025
//Wijzig of ken toe soort bediening tafels
//Kop aangepast
//Logo refresh
require_once('../../../data/connectie_clubmatch.php');
$Path = '../../../data/connectie_clubmatch.php';
require_once('PHP/Functies_biljarten.php');

$Copy = Date("Y");
$Bediening = array();

//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1002_CRJ@#" }

$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

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
      $Logo_naam = "Beheer/uploads/Logo_" . $Org_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (count($_POST) != 1) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>ClubMatch</title>
    <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
    <meta name="Description" content="ClubMatch" />
    <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
    <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="PHP/script_competitie.js" defer></script>
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
          <form name="cancel" method="post" action="../Start.php">
            <input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

$Aantal_tafels = fun_aantaltafels($Code, $Path);

//haal gegevens op
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $sql = "SELECT * FROM bj_bediening WHERE org_nummer = '$Org_nr' ORDER BY tafel_nr";
  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  $teller = 0;
  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $Tafel_nr = $resultaat['tafel_nr'];
    $Soort = $resultaat['soort'];
    $teller++;

    $Bediening[$teller]['tafel_nr'] = $Tafel_nr;
    $Bediening[$teller]['soort'] = $Soort;
  }

  $Aantal_records = $teller;
  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

if ($Aantal_records != $Aantal_tafels) {
  print("Fout in aantal tafels !<br>Aantal records: $Aantal_records en Aantal tafels: $Aantal_tafels");
  exit;
}

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Bediening scorebord wijzigen</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch Online" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
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
  <form name="nieuw" method="post" action="Bediening02.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="85" align="left" valign="middle" bgcolor="#006600"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
        <td width="434" align="center" valign="middle" bgcolor="#006600" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="40" align="center" valign="middle" bgcolor="#006600">
          <h2>Wijzigen bediening scoreborden</h2>
        </td>
      </tr>
      <tr>
        <td height="auto" align="center" valign="middle" bgcolor="#009900">
          De scoreborden bij de tafels kunnen op 2 manieren bediend worden:<br><br>
          <strong>Met de bijbehorende draadloze muis</strong><br>
          Daarmee worden de knoppen op het scorebord zelf bediend. Kies dan "Muis" door op het rondje (radio-button) te klikken.
          <br><br>
          <strong>Met een aparte (kleine) tablet of zelfs een smartphone</strong><br>
          Dan wordt het scorebord bediend vanaf de tablet of smartphone. Kies dan "Tablet".<br><br>
          NB: in de diverse Handleidingen van ClubMatch Online staat uitgebreid beschreven wat de verschillen zijn en hoe een en ander werkt.
        </td>
        <td align="center" valign="top" bgcolor="#009900">
          <table width="400" border="1">
            <tr>
              <td align="center" width="75" class="grootwit"><strong>Tafel_nr</strong></td>
              <td align="center" class="grootwit"><strong>Bediening</strong></td>
            </tr>
            <?php
            for ($a = 1; $a < $Aantal_tafels + 1; $a++) {
              $Nm = "taf_" . $a;
              $Srt = $Bediening[$a]['soort'];

            ?>
              <tr>
                <td align="center" width="75" class="grootwit"><strong><?php print("$a"); ?></strong></td>
                <td align="center" style="font-size:24px;">
                  <?php
                  if ($Srt == 1) {
                  ?>
                    <input type="radio" name="<?php print("$Nm"); ?>" value="1" checked>Muis &nbsp;<input type="radio" name="<?php print("$Nm"); ?>" value="2">Tablet
                  <?php
                  } else {
                  ?>
                    <input type="radio" name="<?php print("$Nm"); ?>" value="1">Muis &nbsp;<input type="radio" name="<?php print("$Nm"); ?>" value="2" checked>Tablet
                  <?php
                  }
                  ?>
                </td>
              </tr>
            <?php
            }
            ?>
          </table>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="15" bgcolor="#009900">&nbsp;</td>
      </tr>
      <tr>
        <td colspan="2" height="70" align="center" bgcolor="#009900" class="groot">
          <input type="submit" class="submit-button" value="Wijzigingen akkoord" style="width:220px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Wijzig naam en/of aantal tafels" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="2">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="ClubMatch_start.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" style="width:150px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="3">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#006600">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
      </tr>
    </table>
  </form>
</body>

</html>