<?php
//© Hans Eekels, versie 22-06-2025
//Advertentie uploaden
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Copy = Date("Y");

$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

if (isset($_POST['user_code'])) {
  $Code = $_POST['user_code'];
  if (strlen($Code) != 10) {
    $bAkkoord = FALSE;
  } else {
    $Gebruiker_nr = substr($Code, 0, 4);
    $Gebruiker_naam = fun_testgebruiker($Code, $Path);
  }
} else {
  $bAkkoord = FALSE;
}


if (count($_POST) != 1) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
  //terug naar start
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Fout</title>
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

//check aantal slides in de map
//naam slide is Slide_1000_01 bij gebruikernummer 1000 en max 20
$Aantal_slides = 0;

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
          //toevoegen aan $Bestanden als naam klopt
          $Hulp_1 = $file;    //Slide_1000_01 
          if (substr($Hulp_1, 0, 6) == "Slide_") {
            $Hulp_2 = substr($Hulp_1, 6, 4);  //gebr nr
            if (intval($Hulp_2) == $Gebruiker_nr) {
              $teller++;
              $Bestanden[$teller]['naam'] = $file;
            }
          }  //end if Slide_
        }
      }  //end while
    }
    closedir($dh);
  }
}
$Aantal_slides = $teller;
$Aantal_nog_uploaden = 20 - $Aantal_slides;

//verder
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Slide uploaden</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_toernooi.js" defer></script>
  <script>
    function toggleUploadButton() {
      const fileInput = document.getElementById('fileToUpload');
      const uploadButton = document.getElementById('uploadButton');

      // Als er een bestand is gekozen, toon de knop
      if (fileInput.files.length > 0) {
        uploadButton.style.display = 'block';
      } else {
        uploadButton.style.display = 'none';
      }
    }
  </script>
  <style type="text/css">
    body {
      width: 900px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <table width="900" border="0">
    <tr>
      <td width="210" height="105" align="center" valign="middle" bgcolor="#006600">
        <img src="../Figuren/Logo_standaard.jpg" width="210" height="105" alt="Logo" />
      </td>
      <td width="680" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <h1>ToernooiProf Online</h1>
        <strong><?php print("$Gebruiker_naam"); ?></strong>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="40" align="center" valign="middle" bgcolor="#006600">
        <h1>Slide uploaden</h1>
      </td>
    </tr>
    <tr>
      <td height="50" colspan="2" align="left" bgcolor="#FFFFFF" class="grootzwart">
        <div style="margin:10px">
          U kunt hier een slide (advertentie of mededeling) uploaden, dat wordt gebruikt in de slide-showw op uw scorebord(en).
          Dit zijn de eisen die aan uw slide worden gesteld:
          <ul>
            <li>Het moet een figuur/foto zijn en alleen een bestand met de extensie .JPG of .jpg</li>
            <li>De grootte mag maximaal 2 MB, dus 2000 KB zijn. </li>
            <li>De verhouding breedte : hoogte dient 2 : 1 te zijn. De slide wordt namelijk altijd getoond in een breedte van 1800 pixels en een hoogte van 900 pixels.</li>
            <li>U kunt maximaal 20 slides uploaden.</li>
          </ul>
          U heeft <?php print("$Aantal_slides"); ?> slides geupload, zodat u nog <?php print("$Aantal_nog_uploaden"); ?> slides kunt uploaden. NB: u kunt altijd ruimte vrijmaken door slides te verwijderen.
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="80" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <?php
        if ($Aantal_nog_uploaden < 1) {
        ?>
          <strong>U heeft het maximum van 20 slides al bereikt; verwijder eerst bestaande slides om nieuwe slides te kunnen uploaden !</strong>
        <?php
        } else {
        ?>
          <form action="upload_slide.php" method="post" enctype="multipart/form-data">
            <table width="850" border="0">
              <tr>
                <td height="50" class="grootwit">
                  Selecteer uw slide:
                  <input type="file" name="fileToUpload" id="fileToUpload" onChange="toggleUploadButton()">
                </td>
                <td align="center">
                  <input name="submit" type="submit" id="uploadButton" class="submit-button"
                    value="Upload slide"
                    style="width:190px; height:40px; background-color:#000; color:#FFF; font-size:16px; display:none;"
                    title="Upload slide"
                    onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                  <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
                  <input type="hidden" name="volg_nr" value="<?php print("$Aantal_slides"); ?>">
                </td>
              </tr>
            </table>
          </form>
        <?php
        }
        ?>
      </td>
    </tr>
    <tr>
      <td height="50" align="center" bgcolor="#006600">
        <form name="terug" method="post" action="Beheer_slideshow.php">
          <input type="submit" class="submit-button" value="Terug" style="width:190px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
            title="Terug" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="right" bgcolor="#006600" class="klein">&copy;Hans Eekels&nbsp; <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>