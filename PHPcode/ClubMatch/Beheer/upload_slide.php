<?php
//© Hans Eekels, versie 02-12-2025
//Slide uploaden
//var_dump user-code en volgnr met 1 verhogen
//Logo refresh

/*
var_dump($_POST) geeft: array(3) { ["submit"]=> string(12) "Upload slide" ["user_code"]=> string(10) "1002_CRJ@#" ["volg_nr"]=> string(1) "0" }
var_dump($_FILES) geeft:
array(1) { ["
			fileToUpload"]=> array(6) { 
			["name"]=> string(16) "Kia_sportage.JPG" 
			["full_path"]=> string(16) "Kia_sportage.JPG" 
			["type"]=> string(10) "image/jpeg" 
			["tmp_name"]=> string(14) "/tmp/phpphy5TG" 
			["error"]=> int(0) 
			["size"]=> int(61039) } }

check op image
check op grootte
check op extensie jpg
rename naar Slide_1000_01.jpg => Slide_gebrnr_teller van 01 t/m 20
*/

require_once('../../../../data/connectie_clubmatch.php');
$Path = '../../../../data/connectie_clubmatch.php';
require_once("../PHP/Functies_biljarten.php");
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
      $Logo_naam = "../Beheer/uploads/Logo_" . $Org_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (isset($_POST['volg_nr']))  //is aantal slides bv 6, dan is volgnr vanaf 10 dus 15, dus volgende 16 = volgnr + 10
{
  $Volg_nr = $_POST['volg_nr'] + 10;
} else {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  //terug naar start
  $Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
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
//initialiseren bericht
$error_message = "";

$target_dir = "slideshow/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);

//check
//print($target_file) geeft: 

$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

// Check if image file is a actual image or fake image
if (isset($_POST["submit"])) {
  $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
  if ($check !== false) {
    //echo "File is an image - " . $check["mime"] . ".";
    $uploadOk = 1;
  } else {
    $error_message = "Gekozen bestand is geen figuur !<br>";
    $uploadOk = 0;
  }
}

// Check if file already exists
/*
if (file_exists($target_file)) {
  echo "Sorry, file already exists.";
  $uploadOk = 0;
}
*/

// Check file size max 2MB
if ($_FILES["fileToUpload"]["size"] > 2000000) {
  $error_message .= "Sorry, het bestand is te groot !<br>";
  $uploadOk = 0;
}

// Allow certain file formats
if ($imageFileType != "jpg" && $imageFileType != "JPG") {
  $error_message .= "Sorry, alleen JPG-formaat is toegestaan !<br>";
  $uploadOk = 0;
}

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
  $error_message .= "<br>Helaas, het bestand is niet ge-upload !<br>";
} else  // if everything is ok, try to upload file
{
  if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
    $error_message = "Het bestand " . htmlspecialchars(basename($_FILES["fileToUpload"]["name"])) . "<br>is succesvol ge-upload !";
    //nu rename naar standaard
    $old = $target_file;
    $new = "slideshow/Slide_" . $Org_nr . "_" . $Volg_nr . ".jpg";
    rename($old, $new);
  } else {
    $error_message .= "Sorry, er is een fout opgetreden bij het uploaden van uw bestand !";
  }
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
        <h1>Slide opgeslagen</h1>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px; font-size:14px">
          <?php print("$error_message"); ?>
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="60" align="center" valign="middle" bgcolor="#003300">
        <form name="partijen" method="post" action="../ClubMatch_start.php">
          <input type="submit" class="submit-button" value="Naar Startscherm" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
            title="Naar Startscherm" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
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