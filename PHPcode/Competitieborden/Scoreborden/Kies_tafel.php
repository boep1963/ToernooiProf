<?php
//© Hans Eekels, versie 22-06-2025
//Kies tafel voor scorebord 1 t/m aantal taf (max 12)
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../../ClubMatch/PHP/Functies_biljarten.php");

//var_dump($_POST) geeft: array(2) { ["user_code"]=> string(10) "1002_CRJ@#" ["comp_nr"]=> string(1) "1" }
$Copy = Date("Y");

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
      $Logo_naam = "../../ClubMatch/Beheer/uploads/Logo_" . $Org_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../../ClubMatch/Beheer/uploads/Logo_standaard.jpg";
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
    <link href="../../ClubMatch/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../../ClubMatch/PHP/script_competitie.js" defer></script>
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
$Aantal_tafels = fun_aantaltafels($Code, $Path);

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Tafel kiezen</title>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <style type="text/css">
    body,
    td,
    th {
      font-family: Verdana;
      font-size: 16px;
      color: #FFF;
    }

    h1 {
      font-size: 36px;
    }

    h2 {
      font-size: 16px;
    }

    body {
      background-color: #000;
      margin-top: 5px;
      margin-right: auto;
      margin-bottom: 0px;
      margin-left: auto;
      width: 800px;
    }

    .black-square {
      width: 195px;
      height: 195px;
      background-color: #000;
      color: #000;
      border: none;
    }

    .submit-button {
      width: 195px;
      height: 195px;
      background-color: #FF0;
      color: #000;
      border: 2px solid transparent;
      font-size: 72px;
      font-weight: bold;
      cursor: pointer;
    }

    .submit-button:hover {
      border: 5px solid transparent;
      border-color: #F00;
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

<body onContextMenu="return false">
  <form name="tafels" method="post" action="Kies_bediening.php">
    <table width="800" border="0">
      <tr>
        <td colspan="4" height="50" align="center" bgcolor="#003300">
          <h1>Kies tafel</h1>
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </td>
      </tr>

      <tr>
        <td align="center">
          <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
            onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            title="Kies tafel nummer 1" value="1">
        </td>
        <?php
        if ($Aantal_tafels > 1) {
        ?>
          <td align="center">
            <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
              onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
              title="Kies tafel nummer 2" value="2">
          </td>
        <?php
        } else {
        ?>
          <td align="center"><input type="button" class="black-square"></td>
        <?php
        }

        if ($Aantal_tafels > 2) {
        ?>
          <td align="center">
            <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
              onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
              title="Kies tafel nummer 3" value="3">
          </td>
        <?php
        } else {
        ?>
          <td align="center"><input type="button" class="black-square"></td>
        <?php
        }

        if ($Aantal_tafels > 3) {
        ?>
          <td align="center">
            <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
              onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
              title="Kies tafel nummer 4" value="4">
          </td>
        <?php
        } else {
        ?>
          <td align="center"><input type="button" class="black-square"></td>
        <?php
        }
        ?>
      </tr>
      <?php
      if ($Aantal_tafels > 4) {
      ?>
        <tr>
          <td align="center">
            <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
              onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
              title="Kies tafel nummer 5" value="5">
          </td>
          <?php
          if ($Aantal_tafels > 5) {
          ?>
            <td align="center">
              <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
                onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
                title="Kies tafel nummer 6" value="6">
            </td>
          <?php
          } else {
          ?>
            <td align="center"><input type="button" class="black-square"></td>
          <?php
          }

          if ($Aantal_tafels > 6) {
          ?>
            <td align="center">
              <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
                onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
                title="Kies tafel nummer 7" value="7">
            </td>
          <?php
          } else {
          ?>
            <td align="center"><input type="button" class="black-square"></td>
          <?php
          }

          if ($Aantal_tafels > 7) {
          ?>
            <td align="center">
              <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
                onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
                title="Kies tafel nummer 8" value="8">
            </td>
          <?php
          } else {
          ?>
            <td align="center"><input type="button" class="black-square"></td>
          <?php
          }
          ?>
        </tr>
      <?php
      }

      if ($Aantal_tafels > 8) {
      ?>
        <td align="center">
          <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
            onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
            title="Kies tafel nummer 9" value="9">
        </td>
        <?php
        if ($Aantal_tafels > 9) {
        ?>
          <td align="center">
            <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
              onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
              title="Kies tafel nummer 10" value="10">
          </td>
        <?php
        } else {
        ?>
          <td align="center"><input type="button" class="black-square"></td>
        <?php
        }

        if ($Aantal_tafels > 10) {
        ?>
          <td align="center">
            <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
              onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
              title="Kies tafel nummer 11" value="11">
          </td>
        <?php
        } else {
        ?>
          <td align="center"><input type="button" class="black-square"></td>
        <?php
        }

        if ($Aantal_tafels > 11) {
        ?>
          <td align="center">
            <input type="submit" name="tafel_nr" class="submit-button" style="background-color:#FF0; color:#000;"
              onmouseover="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
              title="Kies tafel nummer 12" value="12">
          </td>
        <?php
        } else {
        ?>
          <td align="center"><input type="button" class="black-square"></td>
        <?php
        }
        ?>
        </tr>
      <?php
      }
      ?>
    </table>
  </form>
  <form name="cancel" method="post" action="../Kies_optie.php">
    <table width="800">
      <tr>
        <td height="110 " colspan="4" align="center" bgcolor="#003300">
          <input type="submit" class="submit-button" style="background-color:#CCC; width:170px; height:100px; font-size:36px;"
            value="Cancel" title="Terug naar beheer" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="comp_nr" value="<?php print("$Comp_nr"); ?>">
        </td>
      </tr>
    </table>
  </form>
</body>

</html>