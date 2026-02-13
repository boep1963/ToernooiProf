<?php
//© Hans Eekels, 17-03-2025
//Partij bediening via telefoon

//headers
require_once('../../../data/connectie_clubmatch.php');
$Path = '../../../data/connectie_clubmatch.php';
require_once('../ClubMatch/PHP/Functies_biljarten.php');

$Copy = Date("Y");

//var_dump($_POST) geeft:
//array(1) { ["user_code"]=> string(10) "1000_KYZ@#" }
/*
$bAkkoord = TRUE;      //wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";    //melding bij foute POST

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
      $Logo_naam = "../ClubMatch/Beheer/uploads/Logo_" . $Org_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../ClubMatch/Beheer/uploads/Logo_standaard.jpg";
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
  $Logo_naam = "../ClubMatch/Beheer/uploads/Logo_standaard.jpg";

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
    <link href="../ClubMatch/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../ClubMatch/PHP/script_competitie.js" defer></script>
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
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&nbsp;&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}
*/

?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Scoreborden</title>
<link href="../ClubMatch/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
<script src="../ClubMatch/PHP/script_competities.js" defer></script>
<style type="text/css">
body {
  width: 600px;
  margin-top:0px;
}
h1 {
  font-size: 20px;
}
h2 {
  font-size: 16px;
}
.button:hover {
  border-color: #FFF;
}
.submit-button {
	border: 1px solid transparent;
	cursor: pointer;
}

.submit-button:hover {
	border-color: #FFF;
}
#ennog5A {
	border-color: #FFF;
	border: 2px solid white;
	border-radius: 20px;
}

#ennog5B {
	border-color: #FFF;
	border: 2px solid white;
	border-radius: 20px;
}
#car_A {
	width:150px;
	border-color: #FFF;
	border: 2px solid white;
	border-radius: 30px;
}
#car_B {
	border-color: #FFF;
	border: 2px solid white;
	border-radius: 30px;
}
#brt {
	border-color: #FFF;
	border: 2px solid white;
	border-radius: 30px;
}
#serieA {
	border-color: #FFF;
	border: 2px solid white;
	border-radius: 20px;
}
#serieB {
	border-color: #FFF;
	border: 2px solid white;
	border-radius: 20px;
}
</style>
</head>
<body>
<form name="bediening" method="post" action="#">
<table style="width:100%;" border="0" bgcolor="#003300">
<tr>
	<td width="12%" height="10" align="center" style="width:13%;"></td>
    <td width="14%" align="center" style="width:14%;"></td>
    <td width="12%" align="center" style="width:13%;"></td>
    <td width="12%" align="center" style="width:10%;"></td>
    <td width="13%" align="center" style="width:10%;"></td>
    <td width="12%" align="center" style="width:13%;"></td>
    <td width="13%" align="center" style="width:14%;"></td>
    <td width="12%"align="center" style="width:13%;"></td>
</tr>
<tr>
	<td colspan="3" align="center"><h1>Naam Speler A</h1></td>
    <td colspan="2" align="center">
    <input type="submit" class="submit-button" value="Cancel" style="width:60px; height:20px; background-color:#666; color:#FFF;" 
    onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
    </td>
    <td colspan="3" align="center"><h1>Naam Speler B</h1></td>
</tr>
<tr>
	<td colspan="3" align="center">
	  <div id="car_A" style="font-size:40px; font-weight:bold; color:#FFF; background-color:#F00;">15
	    </div>
    </td>
	<td colspan="2" align="center">
	  <input type="submit" class="submit-button" value="wissel spelers" style="width:100px; height:30px; background-color:#FF0; color:#000;" 
    onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
	  </td>
    <td colspan="2" align="center">
    <div id="car_B" style="width:150px; font-size:40px; font-weight:bold; color:#FFF; background-color:#F00;">22
    </div>
    </td>
    <td align="center">&nbsp;</td>
</tr>

<tr>
	<td align="center">En nog:</td>
    <td colspan="2">&nbsp;</td>
    <td colspan="2" align="center">Max 25 beurten</td>
    <td colspan="2">&nbsp;</td>
    <td align="center">En nog:</td>
</tr>
<tr>
	<td align="center">
    <input type="text" name="ennog5A" id="ennog5A" value="5" size="2"
	style="width:40px; height:40px; font:Arial; font-size:24px; font-weight:bold; background-color:#FFD700; border:none; 
    color:#F00; text-align:center; vertical-align:middle;" readonly>
    </td>
    <td colspan="2" align="center">
    <input type="text" name="serieA" id="serieA" value="5" size="2"
	style="width:40px; height:40px; font:Arial; font-size:24px; font-weight:bold; background-color:#333; border:none; 
    color:#FFF; text-align:center; vertical-align:middle;" readonly>
    </td>
    <td colspan="2" rowspan="2" align="center" valign="top">
    <div id="brt" style="font-size:40px; font-weight:bold; color:#FFF; background-color:#F00;">7
    </div>
    </td>
    <td colspan="2" align="center">
    <input type="text" name="serieB" id="serieB" value="0" size="2"
	style="width:40px; height:40px; font:Arial; font-size:24px; font-weight:bold; background-color:#333; border:none; 
    color:#FFF; text-align:center; vertical-align:middle;" readonly>
    </td>
    <td align="center">
    <input type="text" name="ennog5B" id="ennog5B" value="3" size="2"
	style="width:40px; height:40px; font:Arial; font-size:24px; font-weight:bold; background-color:#FFD700; border:none; 
    color:#F00; text-align:center; vertical-align:middle;" readonly>
    </td>
</tr>
<tr>
	<td height="25" align="center">&nbsp;</td>
    <td colspan="2" align="center" valign="top">Huidige serie</td>
    <td colspan="2" align="center" valign="top">Huidige serie</td>
    <td align="center">&nbsp;</td>
</tr>
<tr>
	<td rowspan="2" align="center">
    <input type="submit" class="submit-button" title="min 1" name="min_1A" value="-1"
	style="width:60px; height:60px; font-size:24px; font-weight:bold; background-color:#000; color:#FFF;"
	onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
    </td>
    <td rowspan="3" align="center">
    <input type="submit" class="submit-button" value="INVOER" style="height:80px; width:80px; background-color:#000; color:#FFF; font-size:14px; font-weight:bold;" 
    onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
    </td>
    <td rowspan="2" align="center">
    <input type="submit" class="submit-button" title="plus 1" name="plus_1A" value="+1"
	style="width:60px; height:60px; font-size:24px; font-weight:bold; background-color:#000; color:#FFF;"
	onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
    </td>
    <td height="20" align="center" valign="baseline">Klaar</td>
    <td align="center" valign="baseline">Herstel</td>
    <td rowspan="2" align="center">&nbsp;</td>
    <td rowspan="2" align="center"><img src="Scoreborden/Slot.jpg" width="80" height="80"></td>
    <td rowspan="2" align="center">&nbsp;</td>
</tr>
<tr>
	<td align="center">
    <input type="submit" class="submit-button" name="gereed" title="AFSLUITEN" value="KLAAR"
	style="width:50px; height:50px; background-image:url(klaar_klein.png); background-color:#FFF; color:#FFF; font-size:1px;"
	onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
    </td>
    <td align="center">
    <input type="submit" class="submit-button" name="herstel" title="HERSTEL" value="HERSTEL"
    style="width:50px; height:50px; background-image:url(herstel_klein.png); background-color:#FFF; color:#FFF; font-size:1px;"
    onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
    </td>
    </tr>
</table>
</form>
</body>
</html>