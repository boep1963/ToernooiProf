<?php
//© Hans Eekels, versie 03-12-2025
//Matrix. NB geen matrix bij aantal spelers < 2
//Compnaam bij print
//avondplanning
//keuze periode versimpeld
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");
$Datum = Date("d-m-Y");

$Spelers_h = array();
$Spelers_v = array();
$Uitslagen = array();
$Matrix = array();

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

if (isset($_POST['periode_keuze'])) {
  //tweede keer geladen
  $Periode_keuze = $_POST['periode_keuze'];
  $Aantal_perioden = fun_periode($Comp_nr, $Org_nr, $Path);
} else {
  //eerste keer geladen
  $Periode_keuze = fun_periode($Comp_nr, $Org_nr, $Path);
  $Aantal_perioden = $Periode_keuze;
}

$Naam_hulp = fun_competitienaam($Org_nr, $Comp_nr, 1, $Path);
$Competitie_naam = $Naam_hulp . " [Periode: " . $Periode_keuze . "]";

//spelers
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
    $Spelers_h[$teller]['naam'] = fun_spelersnaam_competitie($Nr, $Org_nr, $Comp_nr, $Periode_keuze, 1, $Path);  //zonder car
    $Spelers_h[$teller]['nummer'] = $Nr;
    $Spelers_v[$teller]['naam'] = fun_spelersnaam_competitie($Nr, $Org_nr, $Comp_nr, $Periode_keuze, 2, $Path);  //met car
    $Spelers_v[$teller]['nummer'] = $Nr;
  }
  $Aantal_spelers = $teller;

  //free result set
  mysqli_free_result($res);

  //sorteren
  sort($Spelers_h);  //key_start = 0
  sort($Spelers_v);  //key_start = 0

  //Matrix vullen met 0;
  for ($h = 0; $h < $Aantal_spelers; $h++) {
    for ($v = 0; $v < $Aantal_spelers; $v++) {
      $Matrix[$h][$v] = 0;    //hierna vullen met uitslagen (0=geen uitslag, 1=winst/groen, 2=verlies/rood, 3=remise/geel
    }
  }  //end for $a

  //uitslagen
  $sql = "SELECT * FROM bj_uitslagen WHERE org_nummer = '$Org_nr' AND comp_nr = '$Comp_nr' AND periode = '$Periode_keuze'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
    $Speler_h = $resultaat['sp_1_nr'];
    $Speler_v = $resultaat['sp_2_nr'];
    $Punt_h = $resultaat['sp_1_punt'];
    $Punt_v = $resultaat['sp_2_punt'];
    //winst, verlies of remise
    if ($Punt_h > $Punt_v) {
      $Kleur_h = 1;
      $Kleur_v = 2;
    }
    if ($Punt_h < $Punt_v) {
      $Kleur_h = 2;
      $Kleur_v = 1;
    }
    if ($Punt_h == $Punt_v) {
      $Kleur_h = 3;
      $Kleur_v = 3;
    }

    //nu toekennen in matrix
    //speler_h
    for ($h = 0; $h < $Aantal_spelers; $h++) {
      if ($Spelers_h[$h]['nummer'] == $Speler_h) {
        //toekennen positie
        $Pos_h = $h;
        break;
      }
    }

    //speler_v
    for ($v = 0; $v < $Aantal_spelers; $v++) {
      if ($Spelers_v[$v]['nummer'] == $Speler_v) {
        //toekennen positie
        $Pos_v = $v;
        break;
      }
    }

    //matrix vullen
    //horizontaal
    $Matrix[$Pos_h][$Pos_v] = $Kleur_h;
    //vertikaal
    $Matrix[$Pos_v][$Pos_h] = $Kleur_v;
  }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//bepaal breedte en hoogte tabellen
//breedte is kolombreedten + extra nl aantal_kolommen * 6 + 4
$breed = 175 + ($Aantal_spelers * 35) + 10;
//$hoog = ($Aantal_spelers * 24);

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Matrix</title>
  <meta name="Keywords" content="Biljarten" />
  <meta name="Description" content="Biljartprogramma" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <style>
    body,
    td,
    th {
      font-family: Verdana;
      font-size: 14px;
      color: #FFF;
    }

    .zwart {
      font-family: Verdana;
      font-size: 14px;
      color: #000;
    }

    .klein {
      font-family: Verdana;
      font-size: 10px;
      color: #FFF;
    }

    h1 {
      font-size: 24px;
    }

    h2 {
      font-size: 16px;
    }

    body {
      background-color: #FFF;
      margin: 0 auto;
      /* Kortere manier om marges aan te geven */
      width: 100%;
      /* Zorgt ervoor dat de body de volledige breedte van de viewport inneemt */
    }

    .hoofdtabel {
      margin: 0 auto;
    }

	input[type="submit"] {
	  width: 170px;
	  border-radius: 8px;
	  background-color: #000;
	  color: #fff;
	}
	input[type="button"] {
	  width: 170px;
	  border-radius: 8px;
	  background-color: #fff;
	  color: #000;
	}
	.submit-button {
	  border: 2px solid transparent;
	  border-radius: 8px;
	  cursor: pointer;
	}
	.submit-button:hover {
	  border-color: #fff;
	}

    .scroll {
      height: 330px;
      overflow-y: scroll;
    }

    div.a {
      width: 29px;
      height: 170px;
      writing-mode: vertical-lr;
      display: inline-block;
      text-orientation: mixed;
    }
  </style>
  <script type="text/javascript">
    function mouseIn(event) {
      var image = event.srcElement;
      image.border = '2';
      image.style.borderColor = "#FFF";
    }

    function mouseOut(event) {
      var image = event.srcElement;
      image.border = '0';
    }

    function mouseInBut(event) {
      var button = event.target || event.srcElement;
      button.style.borderColor = "#FFF";
    }

    function mouseOutBut(event) {
      var button = event.target || event.srcElement;
      button.style.borderColor = "transparent";
    }

    function printDiv() {
      var originalContents = document.body.innerHTML;
      var printableArea = document.createElement('div');
      printableArea.id = 'printableArea';

      // Kopieer inhoud van beide tabellen naar printableArea
      var mainTable = document.getElementById('mainTable').cloneNode(true);
      var scrollableTable = document.getElementById('scrollableTable').cloneNode(true);

      // Zet de volledige inhoud van de scroll-div in printableArea
      var scrollableContent = document.getElementById('scrollableTable').innerHTML;
      scrollableTable.innerHTML = scrollableContent;

      // Zet tijdelijke CSS om de scroll-div volledig weer te geven
      var css = '<style> .scroll { height: auto; overflow: visible; } </style>';

      printableArea.appendChild(mainTable);
      printableArea.appendChild(scrollableTable);

      document.body.innerHTML = css + printableArea.outerHTML;

	  setTimeout(function() {
		window.print();
		document.body.innerHTML = originalContents;
	  }, 500);
		  
	  /*
	  window.print();
      // Herstel de originele inhoud van de pagina na het printen
      document.body.innerHTML = originalContents;
	  */
      // Herlaad de pagina om eventuele verstoringen te verhelpen (verwijderd op 2-7-2025)
      // location.reload();
    }
  </script>
</head>

<body>
  <table class="hoofdtabel" width="<?php print("$breed"); ?>" border="0">
    <tr>
      <td height="40" colspan="4" align="center" valign="left" bgcolor="#009900">
        <h2>Matrix&nbsp;<?php print("$Competitie_naam ($Datum)"); ?></h2>
      </td>
    </tr>
    <tr>
      <td colspan="4" align="left">
        <div id="mainTable">
          <table width="<?php print("$breed"); ?>" bgcolor="#FFFFFF" border="1">
            <tr>
              <td align="center" class="zwart"><strong><?php print("$Competitie_naam"); ?></strong></td>
            </tr>
          </table>
          <table width="<?php print("$breed"); ?>" bgcolor="#FFFFFF" border="1">
            <tr>
              <td width="200" height="170" align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
                <img src="../../Figuren/Matrix.jpg" width="175" height="130" alt="Matrix">
              </td>
              <?php
              for ($a = 0; $a < $Aantal_spelers; $a++) {
                $Naam = $Spelers_h[$a]['naam'];
              ?>
                <td width="170" align="left" valign="top" class="zwart">
                  <div class="a">
                    <?php print("$Naam"); ?>
                  </div>
                </td>
              <?php
              }
              ?>
            </tr>
          </table>
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="4" valign="top">
        <div class="scroll" id="scrollableTable">
          <table width="<?php print("$breed"); ?>" border="1">
            <?php
            for ($a = 0; $a < $Aantal_spelers; $a++) {
              $Naam = $Spelers_v[$a]['naam'];
            ?>
              <tr>
                <td height="30" width="175" align="left" class="zwart">
                  <?php print("$Naam"); ?>
                </td>
                <?php
                for ($b = 0; $b < $Aantal_spelers; $b++) {
                  if ($a == $b) {
                ?>
                    <td width="30" align="center" bgcolor="#000000">&nbsp;</td>
                    <?php
                  } else {
                    $Kleur = $Matrix[$a][$b];
                    if ($Kleur == 0) {
                    ?>
                      <td width="30" align="center" bgcolor="#FFFFFF">&nbsp;</td>
                    <?php
                    }
                    if ($Kleur == 1) {
                    ?>
                      <td width="30" align="center" bgcolor="#00CC00">&nbsp;</td>
                    <?php
                    }
                    if ($Kleur == 2) {
                    ?>
                      <td width="30" align="center" bgcolor="#FF0000">&nbsp;</td>
                    <?php
                    }
                    if ($Kleur == 3) {
                    ?>
                      <td width="30" align="center" bgcolor="#FFCC00">&nbsp;</td>
                <?php
                    }
                  }
                }
                ?>
              </tr>
            <?php
            }
            ?>
          </table>
        </div>
      </td>
    </tr>
    <tr>
      <td width="270" height="35" align="center" valign="middle" bgcolor="#009900">Gekozen periode: <?php print("$Periode_keuze"); ?></td>
      <td width="540" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootzwart">
        <table width="540" border="0">
          <td width="104" align="center">
            <form name="toon matrix_1" method="post" action="Matrix.php">
              <?php
              if ($Periode_keuze == 1) {
              ?>
                <input type="submit" class="submit-button" value="Periode 1" style="width:100px; height:20px; background-color:#000; color:#FFF; font-size:14px;"
                  title="Toon matrix in periode 1" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
              <?php
              } else {
              ?>
                <input type="submit" class="submit-button" value="Periode 1" style="width:100px; height:20px; background-color:#666666; color:#FFF; font-size:14px;"
                  title="Toon matrix in periode 1" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
              <?php
              }
              ?>
              <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
              <input type="hidden" name="periode_keuze" value="1">
            </form>
          </td>
          <td width="104" align="center">
            <?php
            if ($Aantal_perioden > 1) {
            ?>
              <form name="toon matrix_2" method="post" action="Matrix.php">
                <?php
                if ($Periode_keuze == 2) {
                ?>
                  <input type="submit" class="submit-button" value="Periode 2" style="width:100px; height:20px; background-color:#000; color:#FFF; font-size:14px;"
                    title="Toon matrix in periode 2" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <?php
                } else {
                ?>
                  <input type="submit" class="submit-button" value="Periode 2" style="width:100px; height:20px; background-color:#666666; color:#FFF; font-size:14px;"
                    title="Toon matrix in periode 2" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <?php
                }
                ?>
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
                <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
                <input type="hidden" name="periode_keuze" value="2">
              </form>
            <?php
            }
            ?>
          </td>
          <td width="104" align="center">
            <?php
            if ($Aantal_perioden > 2) {
            ?>
              <form name="toon matrix_3" method="post" action="Matrix.php">
                <?php
                if ($Periode_keuze == 3) {
                ?>
                  <input type="submit" class="submit-button" value="Periode 3" style="width:100px; height:20px; background-color:#000; color:#FFF; font-size:14px;"
                    title="Toon matrix in periode 3" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <?php
                } else {
                ?>
                  <input type="submit" class="submit-button" value="Periode 3" style="width:100px; height:20px; background-color:#666666; color:#FFF; font-size:14px;"
                    title="Toon matrix in periode 3" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <?php
                }
                ?>
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
                <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
                <input type="hidden" name="periode_keuze" value="3">
              </form>
            <?php
            }
            ?>
          </td>
          <td width="104" align="center">
            <?php
            if ($Aantal_perioden > 3) {
            ?>
              <form name="toon matrix_4" method="post" action="Matrix.php">
                <?php
                if ($Periode_keuze == 4) {
                ?>
                  <input type="submit" class="submit-button" value="Periode 4" style="width:100px; height:20px; background-color:#000; color:#FFF; font-size:14px;"
                    title="Toon matrix in periode 4" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <?php
                } else {
                ?>
                  <input type="submit" class="submit-button" value="Periode 4" style="width:100px; height:20px; background-color:#666666; color:#FFF; font-size:14px;"
                    title="Toon matrix in periode 4" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <?php
                }
                ?>
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
                <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
                <input type="hidden" name="periode_keuze" value="4">
              </form>
            <?php
            }
            ?>
          </td>
          <td width="104" align="center">
            <?php
            if ($Aantal_perioden > 4) {
            ?>
              <form name="toon matrix_5" method="post" action="Matrix.php">
                <?php
                if ($Periode_keuze == 5) {
                ?>
                  <input type="submit" class="submit-button" value="Periode 5" style="width:100px; height:20px; background-color:#000; color:#FFF; font-size:14px;"
                    title="Toon matrix in periode 5" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <?php
                } else {
                ?>
                  <input type="submit" class="submit-button" value="Periode 5" style="width:100px; height:20px; background-color:#666666; color:#FFF; font-size:14px;"
                    title="Toon matrix in periode 5" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <?php
                }
                ?>
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
                <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
                <input type="hidden" name="periode_keuze" value="5">
              </form>
            <?php
            }
            ?>
          </td>
        </table>
      </td>
      <td align="center" valign="middle" bgcolor="#009900">
        <input type="button" class="submit-button" style="width:200px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
          onclick="printDiv()" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
      </td>
    </tr>
    <tr>
      <td width="270" height="35" align="center" valign="middle" bgcolor="#009900">
        <form name="terug" method="post" action="Competitie_beheer.php">
          <input type="submit" class="submit-button" style="width:200px; height:30px; font-size:16px;"
            value="Terug naar beheer" title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </form>
      </td>
      <td width="270" align="center" valign="middle" bgcolor="#009900">
        <form name="planning" method="post" action="Planning_01.php">
          <input type="submit" class="submit-button" style="width:200px; height:30px; background-color:#000; color:#FFF; font-size:16px;"
            value="Maak dag-planning" title="Planning" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
          <input type="hidden" name="periode_keuze" value="<?php print("$Periode_keuze"); ?>">
        </form>
      </td>
      <td width="270" align="center" valign="middle" bgcolor="#009900">
        <input type="button" class="submit-button" style="width:150px; height:30px; background-color:#F00; color:#FFF; font-size:24px; font-weight:bold;"
          name="help4" value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
          onClick="window.open('../Help/Help_matrix.php','Help','width=610,height=440,menubar=no, status=no, scrollbars=no, titlebar=no, toolbar=no, location=no'); return false" />
      </td>
      <td align="right" bgcolor="#009900" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>