<?php
//© Hans Eekels, versie 26-11-2025
//Eigen logo uploaden ToernooiProf
/*
check op image
check op grootte
check op extensie jpg
rename naar Logo_Gebruiker_code.jpg
schalen
opvullen met wit
$target_file aangepast regel 115
*/
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

/*
var_dump($_POST) geeft:
array(2) { ["submit"]=> string(17) "Upload eigen logo" ["user_code"]=> string(10) "1070_JFM@#" }
*/

$Copy = Date("Y");

$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

if (isset($_POST['user_code'])) {
  $Code = $_POST['user_code'];
  if (strlen($Code) != 10) {
    $bAkkoord = FALSE;
  } else {
    $Gebruiker_code = substr($Code, 0, 4);    //nodig voor naam logo format: Logo_1000.jpg
    $Gebruiker_naam = fun_testgebruiker($Code, $Path);
  }
} else {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
    <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
    <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../PHP/script_toernooi.js" defer></script>
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
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="../Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
          <form name="partijen" method="post" action="../../Start.php">
            <input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

/*
var_dump($_FILES) geeft:
array(1) { ["fileToUpload"]=> 
	array(6) { 
		["name"]=> string(9) "Gerda.jpg" 
		["full_path"]=> string(9) "Gerda.jpg" 
		["type"]=> string(10) "image/jpeg" 
		["tmp_name"]=> string(14) "/tmp/phpJa3o9x" 
		["error"]=> int(0) 
		["size"]=> int(213797) } }
*/
//initialiseren bericht
$error_message = "";

$target_dir = "uploads/";
//$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$target_file = $target_dir . "upload_temp.jpg";

//check
//print($target_file) geeft: uploads/klaverjassen.jpg

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

// Check file size
if ($_FILES["fileToUpload"]["size"] > 1000000) {
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

    $target_width  = 400;
    $target_height = 200;
    $target_ratio  = $target_width / $target_height;

    // Origineel openen
    list($orig_width, $orig_height) = getimagesize($target_file);
    $orig_ratio = $orig_width / $orig_height;

    if ($orig_ratio > $target_ratio) {
      // te breed → breedte bepaalt
      $new_width  = $target_width;
      $new_height = intval($target_width / $orig_ratio);
    } else {
      // te hoog → hoogte bepaalt
      $new_height = $target_height;
      $new_width  = intval($target_height * $orig_ratio);
    }

    // Origineel JPG-bestand inladen
    $src = imagecreatefromjpeg($target_file);

    // Wit canvas aanmaken
    $canvas = imagecreatetruecolor($target_width, $target_height);
    $white  = imagecolorallocate($canvas, 255, 255, 255);
    imagefill($canvas, 0, 0, $white);

    // Geschaalde versie maken
    $tmp = imagecreatetruecolor($new_width, $new_height);
    imagecopyresampled($tmp, $src, 0, 0, 0, 0, $new_width, $new_height, $orig_width, $orig_height);

    // Centreren
    $offset_x = intval(($target_width - $new_width) / 2);
    $offset_y = intval(($target_height - $new_height) / 2);

    // In het witte canvas plaatsen
    imagecopy($canvas, $tmp, $offset_x, $offset_y, 0, 0, $new_width, $new_height);

    // Overschrijf het originele bestand
    imagejpeg($canvas, $target_file, 90);

    // Opruimen
    imagedestroy($src);
    imagedestroy($tmp);
    imagedestroy($canvas);

    //nu rename naar standaard
    $old = $target_file;
    $new = "uploads/Logo_" . $Gebruiker_code . ".jpg";
    rename($old, $new);

    //email zenden
    $msg = "Nieuw logo ToernooiProf ge-upload door $Gebruiker_naam met code $new";
    $headers = "From: info@specialsoftware.nl";
    // send email
    mail("hanseekels@gmail.com", "Nieuwe logo", $msg, $headers);
  } else {
    $error_message .= "Sorry, er is een fout opgetreden bij het uploaden van uw bestand !";
  }
}
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Logo uploaden</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_toernooi.js" defer></script>
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
      <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="../Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
      <td width="340" align="center" valign="middle" bgcolor="#003300">
        <h1>Melding</h1>
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
        <form name="terug" method="post" action="../Toernooi_start.php">
          <input type="submit" class="submit-button" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
            title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>