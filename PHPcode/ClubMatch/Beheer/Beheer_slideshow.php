<?php
//© Hans Eekels, versie 02-12-2025
//Start slideshow: uploaden en/of delete
//Kop gewijzigd
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(1) { ["user_code"]=> string(10) "1001_CHR@#" }
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

if (count($_POST) != 1) {
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

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Beheer slides</title>
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
  <table width="700" border="0">
    <tr>
      <td width="220" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo"></td>
      <td colspan="3" align="center" valign="middle" bgcolor="#009900" class="kop">
        ClubMatch Online<br>
        <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
      </td>
    </tr>
    <tr>
      <td height="60" colspan="3" align="center" valign="middle" bgcolor="#003300">
        <h2>Beheer slides voor gebruik op scoreborden</h2>
      </td>
    </tr>
    <tr>
      <td height="60" colspan="3" align="center" valign="middle" bgcolor="#003300">
        <div align="center" style="margin:15px; font-size:16px;">
          Bij het aanroepen van de carrousel met slides (dat zijn advertenties en/of mededelingen die achter elkaar op de scoreborden worden getoond), moeten die slides wel beschikbaar zijn.
          Op deze pagina beheert u die slides. U kunt nieuwe slides uploaden en u kunt bestaande slides verwijderen.<br>
          <br>
          Drie opmerkingen:
          <ol>
            <li>De carrousel met slides zijn beschikbaar bij elke competitie die u aanmaakt. Met andere woorden: als u een competitie verwijdert, dan blijven de slides bewaard.</li>
            <li>Er kunnen maximaal 20 slides in de carrousel getoond worden en er kunnen ook maximaal 20 slides ge-upload worden.</li>
            <li>Bij de start van de slideshow (via de scoreborden) kunt u aangeven welke slides er getoond moeten worden.</li>
          </ol>
        </div>
      </td>
    </tr>
    <tr>
      <td width="170" height="60" align="center" valign="middle" bgcolor="#006600">
        <form name="carrousel" method="post" action="advertentie_uploaden.php">
          <input type="submit" class="submit-button" value="Kies" title="Uploaden" style="width:150px; height:50px;" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)" />
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td width="320" align="center" valign="middle" bgcolor="#006600" class="grootwit"><strong>"Nieuwe slide uploaden"</strong></td>
      <td align="center" valign="middle" bgcolor="#006600">
        <input type="button" style="width:150px; height:40px; background-color:#FC0; color:#000; font-size:16px;" name="help"
          value="Help specificaties" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
          onClick="window.open('../Help/Help_specdia.php','Help','width=520,height=500,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
    </tr>
    <tr>
      <td width="170" height="60" align="center" valign="middle" bgcolor="#006600">
        <form name="uploaden" method="post" action="advertentie_delete.php">
          <input type="submit" class="submit-button" value="Kies" title="Verwijderen" style="width:150px; height:50px;" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)" />
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td width="320" align="center" valign="middle" bgcolor="#006600" class="grootwit"><strong>"Bestaande slide verwijderen"</strong></td>
      <td align="center" valign="middle" bgcolor="#006600">
        <input type="button" style="width:150px; height:40px; background-color:#FC0; color:#000; font-size:16px;" name="help"
          value="Help verwijderen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
          onClick="window.open('../Help/Help_deletedia.php','Help','width=520,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
    </tr>
  </table>
  <form name="cancel" method="post" action="../ClubMatch_start.php">
    <table width="700">
      <tr>
        <td width="170" height="35" align="center" bgcolor="#003300">
          <input type="submit" class="submit-button" style="background-color:#666; color:#FFF; width:150px; height:40px;"
            value="Cancel" title="Terug naar beheer" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
        <td align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
</body>

</html>