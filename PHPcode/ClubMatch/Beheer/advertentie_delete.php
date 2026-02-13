<?php
//© Hans Eekels, 02-12-2025
//verwijder slides
//Kop aangepast
//Logo refresh
require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");

//var_dump($_POST) geeft: array(1) { ["user_code"]=> string(10) "1002_CRJ@#" }

$Copy = Date("Y");
$Bestanden = array();

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

//bestanden ophalen
$directory = "slideshow/";
if (is_dir($directory)) {
  if ($dh = opendir($directory)) {
    $teller = 0;
    while (($file = readdir($dh)) !== false) {
      // Controleer of het een bestand is en geen directory
      if (is_file($directory . "/" . $file)) {
        // Haal de extensie van het bestand op
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        // Controleer of de extensie .jpg is
        if ($extension == "jpg" || $extension == "JPG") {
          //toevoegen aan $Bestanden
          $Hulp_1 = $file;    //Slide_1000_01 
          if (substr($Hulp_1, 0, 6) == "Slide_") {
            $Hulp_2 = substr($Hulp_1, 6, 4);  //gebr nr
            if (intval($Hulp_2) == $Org_nr) {
              $teller++;
              $Bestanden[$teller]['naam'] = $file;
              $Bestanden[$teller]['nummer'] = substr($file, 11, 2);
            }  //end if = gebruiker
          }  //end if Slide_
        }  //end if is jpg
      }  //end if is dir
    }
    closedir($dh);
  }  //end if open dir
}  //end if dir

/*
var_dump($Bestanden) geeft:
array(4) { 
[1]=> array(1) { ["naam"]=> string(17) "Slide_1001_01.jpg" } 
[2]=> array(1) { ["naam"]=> string(17) "Slide_1001_02.jpg" } 
[3]=> array(1) { ["naam"]=> string(17) "Slide_1001_04.jpg" } 
[4]=> array(1) { ["naam"]=> string(17) "Slide_1001_03.jpg" } }
*/
$Aantal_slides = $teller;
if ($Aantal_slides > 20) {
  $Aantal_slides = 20;
}
$Aantal_regels = ceil($Aantal_slides / 5);

if ($Aantal_slides == 0) {
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
        <td width="340" align="center" valign="middle" bgcolor="#003300">
          <h1>Foutmelding !</h1>
        </td>
      </tr>
      <tr>
        <td height="50" colspan="2" align="center">
          <div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
            <strong>Er zijn geen bestanden in de map Slide_show gevonden die getoond kunnen worden.<br>
              Ga terug naar Start.</strong>
          </div>
        </td>
      </tr>
      <tr>
        <td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
          <form name="cancel" method="post" action="Beheer_slideshow.php">
            <input type="submit" class="submit-button" value="Terug naar keuze" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar keuze" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
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
?>
<!DOCTYPE html>
<html>

<head>
  <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
  <meta name="Description" content="ClubMatch" />
  <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_competitie.js" defer></script>
  <style type="text/css">
    body {
      width: 1000px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <form name="verwijderen" method="post" action="advertentie_delete02.php">
    <table width="1000" border="0">
      <tr>
        <td width="220" height="85" align="left" valign="middle" bgcolor="#009900"><img id="logoAfbeelding" src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo"></td>
        <td colspan="4" align="center" valign="middle" bgcolor="#009900" class="kop">
          ClubMatch Online<br>
          <font style="font-size:18px; font-weight:bold;"><?php print("$Org_naam"); ?></font>
        </td>
      </tr>
      <tr>
        <td height="35" colspan="5" align="center" bgcolor="#006600" class="grootwit"><strong>Slides verwijderen: vink de slide(s) aan die verwijderd dienen te worden<strong></td>
      </tr>
      <?php
      $Teller_a = 0;
      $Teller_b = 0;

      for ($a = 1; $a < $Aantal_regels + 1; $a++) {
      ?>
        <tr>
          <?php
          for ($b = 1; $b < 6; $b++) {
            $Teller_a++;
            if ($Teller_a <= $Aantal_slides) {
              $Img = $Bestanden[$Teller_a]['naam'];
              $Pad = "slideshow/" . $Img;
          ?>
              <td width="195" height="97" align="center" valign="middle"><img src="<?php print("$Pad"); ?>" width="195" height="97"></td>
            <?php
            } else {
            ?>
              <td align="center" valign="middle">&nbsp;</td>
          <?php
            }
          }
          ?>
        </tr>
        <tr>
          <?php
          for ($b = 1; $b < 6; $b++) {
            $Teller_b++;
            if ($Teller_b <= $Aantal_slides) {
              $Nummer = $Bestanden[$Teller_b]['nummer'];
          ?>
              <td width="195" bgcolor="#666666">
                <input type="checkbox" style="height:30px; width:30px; font-size:24px;" name="<?php print("$Nummer"); ?>">
              </td>
            <?php
            } else {
            ?>
              <td width="451" bgcolor="#666666">&nbsp;</td>
          <?php
            }
          }  //end for $b is 5 per regel
          ?>
        </tr>
      <?php
      }  //end for $a is aantal regels
      ?>
      <tr>
        <td height="50" colspan="5" align="center" valign="middle" bgcolor="#666666">
          <input type="submit" style="height:40px; width:170px; background-color:#060; color:#FFF; font-size:16px;"
            title="Verwijderen" value="Verwijder slides" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="Beheer_slideshow.php">
    <table width="1000">
      <tr>
        <td height="50" align="left" valign="middle" bgcolor="#666666">&nbsp;
          <input type="submit" class="submit-button" style="width:120px; height:30px; background-color:#CCC; color:#000; font-size:16px;"
            title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" tabindex="9">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
</body>

</html>