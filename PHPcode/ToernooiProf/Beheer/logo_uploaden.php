<?php
//© Hans Eekels, versie 10-10-2025
//Eigen logo uploaden
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

/*
var_dump($_POST) geeft:
array(1) { ["user_code"]=> string(10) "1070_JFM@#" }
*/

$Copy = Date("Y");

$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

if (isset($_POST['user_code'])) {
  $Code = $_POST['user_code'];
  if (strlen($Code) != 10) {
    $bAkkoord = FALSE;
  } else {
    $Gebruiker_code = substr($Code, 0, 4);
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

//verder
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
        <h1>Eigen logo uploaden</h1>
      </td>
    </tr>
    <tr>
      <td height="50" colspan="2" align="left" bgcolor="#FFFFFF" class="grootzwart">
        <div style="margin:10px">
          U kunt hier een eigen logo uploaden, dat wordt gebruikt in het programma en op overzichten die u kunt uitprinten.
          Dit zijn de eisen die aan uw logo worden gesteld:
          <ul>
            <li>Het moet een figuur/foto zijn en alleen een bestand met de extensie .JPG of .jpg</li>
            <li>De grootte mag maximaal 1 MB, dus 1000 KB zijn. </li>
            <li>De verhouding breedte : hoogte dient bij voorkeur 2 : 1 te zijn. Het logo wordt namelijk altijd verkleind of vergroot tot een breedte van 200px en een hoogte van 100px;
              dus als de verhouding niet 2 op 1 is, dan worden de randen opgevuld met een witte achtergrond.</li>
            <li>Als u eerder een eigen logo hebt ge-upload, dan wordt bij een nieuwe upload het oude logo (zonder waarschuwing) overschreden.</li>
          </ul>
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="80" align="center" valign="middle" bgcolor="#006600">
        <form action="upload.php" method="post" enctype="multipart/form-data">
          <table width="850" border="0">
            <tr>
              <td height="50" class="grootwit">
                Selecteer uw logo:
                <input type="file" name="fileToUpload" id="fileToUpload" onChange="toggleUploadButton()">
              </td>
              <td align="center">
                <input name="submit" type="submit" id="uploadButton" class="submit-button"
                  value="Upload eigen logo"
                  style="width:190px; height:40px; background-color:#000; color:#FFF; font-size:16px; display:none;"
                  title="Upload uw eigen logo"
                  onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
              </td>
            </tr>
          </table>
        </form>
      </td>
    </tr>
    <tr>
      <td height="50" align="center" bgcolor="#006600">
        <form name="terug" method="post" action="../Toernooi_start.php">
          <input type="submit" class="submit-button" value="Cancel" style="width:190px; height:40px; background-color:#666; color:#FFF; font-size:16px;"
            title="Terug naar Start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="right" bgcolor="#006600" class="klein">info: hanseekels@gmail.com &nbsp;&copy;&nbsp; <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>