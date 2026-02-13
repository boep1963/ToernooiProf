<?php
//© Hans Eekels, versie 15-12-2025
//Toernooigegevens wijzigingen opslaan
//car-sys toegevoegd, dus nu ook aantal car bij spelers wijzigen als moy_form gewijzigd is
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');
$Copy = Date("Y");

$Spelers = array();

/*
var_dump($_POST) geeft:
//max aantal data
array(8) { 
["t_naam"]=> string(20) "Appelflappentoernooi" 
["t_datum"]=> string(12) "Seizoen 2025" 
["startdatum"]=> string(10) "2025-01-01" 
["einddatum"]=> string(10) "2025-12-31" 
["dsicipline"] => string(1) "1"	1-5

["moy_form"] => string(1) "1"	//alleen bij systeem = 1

["punten_sys"]=> string(1) "1" 
["max_beurten"]=> string(2) "25" 
["min_car"]
["openbaar"]=> string(1) "1" 

["user_code"]=> string(10) "1070_JFM@#" 
["toernooi"]=> string(1) "1"
//niet altijd
punten, min_car, maxbeurten en openbaar
*/

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

if (isset($_POST['user_code'])) {
  $Code = $_POST['user_code'];
  if (strlen($Code) != 10) {
    $bAkkoord = FALSE;
  } else {
    $Gebruiker_naam = fun_testgebruiker($Code, $Path);
    if ($Gebruiker_naam == '9999') {
      $bAkkoord = FALSE;
    } else {
      $Gebruiker_nr = substr($Code, 0, 4);
      //logonaam
      $Logo_naam = "Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['toernooi'])) {
  $bAkkoord = FALSE;
} else {
  $Toernooi_nr = $_POST['toernooi'];
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['t_naam'])) {
  $bAkkoord = FALSE;
} else {
  if (strlen($_POST['t_naam']) < 5) {
    $bAkkoord = FALSE;
    $error_message = "Naam moet uit minimaal 5 tekens bestaan !";
  }
}

if (!isset($_POST['t_datum'])) {
  $bAkkoord = FALSE;
} else {
  if (strlen($_POST['t_datum']) < 5) {
    $bAkkoord = FALSE;
    $error_message = "Datum moet uit minimaal 5 tekens bestaan !";
  }
}

if (!isset($_POST['startdatum'])) {
  $bAkkoord = FALSE;
} else {
  $Start_datum = $_POST['startdatum'];
}

if (!isset($_POST['einddatum'])) {
  $bAkkoord = FALSE;
} else {
  $Eind_datum = $_POST['einddatum'];
}

if (!isset($_POST['discipline'])) {
  $bAkkoord = FALSE;
} else {
  $Discipline = $_POST['discipline'];
}

if (isset($_POST['moy_form']))
{
	  $Moy_form = $_POST['moy_form'];
	  $bMoy_form = TRUE;
}
else
{
	$bMoy_form = FALSE;
}

if (isset($_POST['punten_sys'])) {
  $Punten_sys = $_POST['punten_sys'];
  $bPunten_sys = TRUE;
} else {
  $bPunten_sys = FALSE;
}

if (isset($_POST['min_car'])) {
  $Min_car = $_POST['min_car'];
  $bMin_car = TRUE;
} else {
  $Min_car = FALSE;
}

if (isset($_POST['max_beurten'])) {
  $Max_beurten = $_POST['max_beurten'];
  $bMax_beurten = TRUE;
} else {
  $Max_beurten = FALSE;
}

if (isset($_POST['openbaar'])) {
  $Openbaar = $_POST['openbaar'];
  $bOpenbaar = TRUE;
} else {
  $bOpenbaar = FALSE;
}

if ($bAkkoord == FALSE) {
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
    <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
    <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="PHP/script_toernooi.js" defer></script>
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
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
          <form name="partijen" method="post" action="../Start.php">
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

//verder checks en data escapen
try {
  $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
  if (!$dbh) {
    throw new Exception(mysqli_connect_error());
  }
  mysqli_set_charset($dbh, "utf8");

  $Naam_hulp_1 = mysqli_real_escape_string($dbh, $_POST['t_naam']);
  $T_naam = htmlspecialchars($Naam_hulp_1, ENT_QUOTES);

  $Naam_hulp_1 = mysqli_real_escape_string($dbh, $_POST['t_datum']);
  $T_datum = htmlspecialchars($Naam_hulp_1, ENT_QUOTES);

  //opslaan altijd
  $sql = "UPDATE tp_data SET t_naam = '$T_naam', t_datum = '$T_datum', datum_start = '$Start_datum', datum_eind = '$Eind_datum', discipline = '$Discipline'
	WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

  $res = mysqli_query($dbh, $sql);
  if (!$res) {
    throw new Exception(mysqli_error($dbh));
  }

  //opslaan if doorgegeven
  if ($bMoy_form == TRUE) {
    $sql = "UPDATE tp_data SET t_moy_form = '$Moy_form'
		 WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }
  
  if ($bPunten_sys == TRUE) {
    $sql = "UPDATE tp_data SET t_punten_sys = '$Punten_sys'
		 WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }
  
   if ($bMin_car == TRUE) {
    $sql = "UPDATE tp_data SET t_min_car = '$Min_car'
		 WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }
  
  if ($bMax_beurten == TRUE) {
    $sql = "UPDATE tp_data SET t_max_beurten = '$Max_beurten'
		 WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }
  
  if ($bOpenbaar == TRUE) {
    $sql = "UPDATE tp_data SET openbaar = '$Openbaar' WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }
  }

  //toegevoegd: als moy_form is doorgegeven, dan de car bij alle spelers aanpassen !
  if ($bMoy_form == TRUE)
  {
  	//alle aantallen car in tp_spelers en tp_poules aanpassen aan (nieuwe) tabel
	$sql = "SELECT * FROM tp_spelers WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
	  throw new Exception(mysqli_error($dbh));
	}
	
	if (mysqli_num_rows($res) > 0)
	{
		$teller = 0;
		while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
		{
			 $teller++;
			 $Spelers[$teller]['sp_nummer'] = $resultaat['sp_nummer'];
			 $Spelers[$teller]['sp_startmoy'] = $resultaat['sp_startmoy'];
		}
	  	$Aantal_spelers = $teller;
	}
	else
	{
		$Aantal_spelers = 0;
	}	//end if aantal records > 0
  	
	if ($Aantal_spelers > 0)
	{
		//update tp_spelers
		for ($a = 1; $a < $Aantal_spelers + 1; $a++)
		{
			$Nr_sp = $Spelers[$a]['sp_nummer'];
			$Moy_sp = $Spelers[$a]['sp_startmoy'];
			$Car_sp = fun_aantalcar($Gebruiker_nr, $Toernooi_nr, $Moy_sp, $Path);
			
			$sql = "UPDATE tp_spelers SET sp_startcar = '$Car_sp' WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_nummer = '$Nr_sp'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
			  throw new Exception(mysqli_error($dbh));
			}
			
			$sql = "UPDATE tp_poules SET sp_car = '$Car_sp' WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_nummer = '$Nr_sp'";

			$res = mysqli_query($dbh, $sql);
			if (!$res) {
			  throw new Exception(mysqli_error($dbh));
			}
			
		}	//end for per speler in tp_spelers
	
	}	//end if aantal spelers > 0
  }	//end if $bMoy_form == TRUE
	

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//Melding
$error_message = "Toernooigegevens gewijzigd.";
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Toernooi programma</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
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
      <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
      <td colspan="2" height="60" align="center" valign="middle" bgcolor="#006600">
        <form name="akkoord" method="post" action="Toernooi_start.php">
          <input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
            title="Naar beheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>