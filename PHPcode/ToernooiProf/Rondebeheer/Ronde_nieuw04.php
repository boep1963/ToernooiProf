<?php
//© Hans Eekels, versie 15-12-2025
//Verwerken koppeling, check op onbedoelde insert
//Car_sys verwerkt
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

/*
array(19) { ["Moy_speler_7"]=> string(5) "0.500" ["Poule_speler_7"]=> string(1) "1" ["Moy_speler_5"]=> string(5) "0.625" ["Poule_speler_5"]=> string(1) "1" ["Moy_speler_15"]=> string(5) "0.500" ["Poule_speler_15"]=> string(1) "2" ["Moy_speler_1"]=> string(5) "0.875" ["Poule_speler_1"]=> string(1) "2" ["Moy_speler_13"]=> string(5) "0.500" ["Poule_speler_13"]=> string(1) "3" ["Moy_speler_3"]=> string(5) "0.750" ["Poule_speler_3"]=> string(1) "3" ["Moy_speler_9"]=> string(5) "0.625" ["Poule_speler_9"]=> string(1) "4" ["Moy_speler_11"]=> string(5) "0.500" ["Poule_speler_11"]=> string(1) "4" 
["user_code"]=> string(10) "1000_SDX@#" ["t_nummer"]=> string(1) "1" ["poule_nr"]=> string(1) "1" }
*/

/*
var_dump($_POST) geeft: checken op Car_speler_x @@@@
array(11) { 
["Moy_speler_3"]=> string(5) "0.855" ["Car_speler_3]=> string(2) "25" ["Poule_speler_3"]=> string(1) "1" 
["Moy_speler_1"]=> string(5) "1.525" ["Poule_speler_1"]=> string(1) "2" 
["Moy_speler_4"]=> string(5) "1.100" ["Poule_speler_4"]=> string(1) "0" 
["Moy_speler_2"]=> string(5) "1.200" ["Poule_speler_2"]=> string(1) "4" 

["user_code"]=> string(10) "1001_CHR@#" 
["t_nummer"]=> string(1) "1" 
["poule_nr"]=> string(1) "1" }
*/

$Copy = Date("Y");

$Spelers = array();
$Spelers_hulp = array();

//POST verwerken
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
      $Logo_naam = "../Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "../Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['t_nummer'])) {
  $bAkkoord = FALSE;
} else {
  $Toernooi_nr = $_POST['t_nummer'];
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (!isset($_POST['poule_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Poule_nr = $_POST['poule_nr'];
  if (filter_var($Poule_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
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

//car_min
$Car_min = fun_carmin($Gebruiker_nr, $Toernooi_nr, $Path);

//verder POST ontleden, let op moy kan 0.000 zijn
$teller = 0;
foreach ($_POST as $key_var => $value_var) {
  if ($key_var == "user_code" || $key_var == "t_nummer" || $key_var == "poule_nr") {
    // niets doen
  } else {
    $Hulp = $key_var;
    $Ln = strlen($key_var);

    if (substr($Hulp, 0, 3) == "Moy")
	{
      // moyenne
      $Spnr = substr($Hulp, 11, $Ln - 11);
      $Moy = floatval(trim($value_var));

      // Voeg de speler alleen toe als er nog geen record voor deze speler is
      if (!isset($Spelers_hulp[$Spnr])) {
        $Spelers_hulp[$Spnr] = [];
      }

      $Spelers_hulp[$Spnr]['spc_nummer'] = $Spnr;
      $Spelers_hulp[$Spnr]['moy_nieuw'] = $Moy;
    }
	elseif (substr($Hulp, 0, 3) == "Car")
	{
		$Spnr = substr($Hulp, 11, $Ln - 11);
      	$Car = intval(trim($value_var));
        if ($Car < $Car_min)
		{
			$Car = $Car_min;
		}		
		$Spelers_hulp[$Spnr]['car_nieuw'] = $Car;
	}
	else
	{
      // poule_nr
      $Spnr = substr($Hulp, 13, $Ln - 13);
      $Poule = intval($value_var);

      // Voeg de speler alleen toe als er nog geen record voor deze speler is
      if (!isset($Spelers_hulp[$Spnr])) {
        $Spelers_hulp[$Spnr] = [];
      }

      $Spelers_hulp[$Spnr]['spc_nummer'] = $Spnr;
      $Spelers_hulp[$Spnr]['poule_nieuw'] = $Poule;
    }
  }
}

$Aantal_spelers_hulp = count($Spelers_hulp);

// poule = 0 eruit en moy-min naar 0.250
$teller = 0;
foreach ($Spelers_hulp as $speler) {
  if ($speler['poule_nieuw'] > 0) {
    $teller++;
    $Moy_nieuw = $speler['moy_nieuw'];
	$Car_nieuw = $speler['car_nieuw'];
    if ($Moy_nieuw < 0.25) {
      $Moy_nieuw = 0.250;
    }

    $Spelers[$teller]['spc_nummer'] = $speler['spc_nummer'];
    $Spelers[$teller]['poule_nieuw'] = $speler['poule_nieuw'];
    $Spelers[$teller]['moy_nieuw'] = $Moy_nieuw;
	$Spelers[$teller]['car_nieuw'] = $Car_nieuw;
  }
}

/*
test bij doorkoppelen 2 spelers: check @@@@
var_dump($Spelers) geeft:
array(2) { 
[1]=> array(3) { ["spc_nummer"]=> string(1) "6" ["poule_nieuw"]=> string(1) "2" ["moy_nieuw"]=> string(5) "0.250" ["car_nieuw"]=> "12"} 
[2]=> array(3) { ["spc_nummer"]=> string(1) "2" ["poule_nieuw"]=> string(1) "4" ["moy_nieuw"]=> string(5) "0.250" } }
*/

$Aantal_spelers = $teller;  //kan 0 zijn

$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
$Nieuwe_ronde = $Huidige_ronde + 1;

//opslaan in poules als $Aantal_spelers > 0
if ($Aantal_spelers > 0) {
  try {
    $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
    if (!$dbh) {
      throw new Exception(mysqli_connect_error());
    }
    mysqli_set_charset($dbh, "utf8");

    for ($a = 1; $a < $Aantal_spelers + 1; $a++) {
      $SpelerNr = $Spelers[$a]['spc_nummer'];
      $PouleNr = $Spelers[$a]['poule_nieuw'];
      $Moy_nieuw = $Spelers[$a]['moy_nieuw'];
	  $Car_nieuw = $Spelers[$a]['car_nieuw'];
	  
      //check op eerdere onbedoelde opslag
      $sql = "SELECT * FROM tp_poules 
		WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_nummer = '$SpelerNr' AND poule_nr = '$PouleNr' AND ronde_nr = '$Nieuwe_ronde'";

      $res = mysqli_query($dbh, $sql);
      if (!$res) {
        throw new Exception(mysqli_error($dbh));
      }

      if (mysqli_num_rows($res) == 0) {
        //opslaan in t_poules met volgnummer voorlopig op '0'
        $sql = "INSERT INTO tp_poules (gebruiker_nr, t_nummer, sp_nummer, sp_moy, sp_car, sp_volgnr, poule_nr, ronde_nr) 
		  VALUES ('$Gebruiker_nr', '$Toernooi_nr', '$SpelerNr', '$Moy_nieuw', '$Car_nieuw', '0', '$PouleNr', '$Nieuwe_ronde')";

        $res = mysqli_query($dbh, $sql);
        if (!$res) {
          throw new Exception(mysqli_error($dbh));
        }
      }  //end if num_rows == 0
    }  //end for per speler

    //close connection
    mysqli_close($dbh);
  } catch (Exception $e) {
    echo $e->getMessage();
  }
}  //end if #spelers > 0

//Melding
if ($Aantal_spelers == 0) {
  $error_message = "U heeft geen spelers gekozen om door te koppelen!<br>U keert terug naar de pagina nieuwe ronde aanmaken.";
} else {
  $error_message = "U heeft $Aantal_spelers spelers van poule $Poule_nr uit huidige ronde $Huidige_ronde doorgekoppeld naar ronde $Nieuwe_ronde!<br>U keert terug naar de pagina nieuwe ronde aanmaken.";
}
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Melding</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 500px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <table width="500" border="0">
    <tr>
      <td width="150" height="77" align="center" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
      <td width="340" align="center" valign="middle" bgcolor="#006600">
        <h1>Melding</h1>
      </td>
    </tr>
    <tr>
      <td height="100" colspan="2" bgcolor="#006600" class="grootwit">
        <div style="text-align:center; margin-left:20px; margin-right:20px; margin-top:10px; margin-bottom:10px;">
          <?php print("$error_message"); ?>
        </div>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="60" align="center" valign="middle" bgcolor="#006600">
        <form name="akkoord" method="post" action="Ronde_nieuw01.php">
          <input type="submit" class="submit-button" value="Akkoord" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:24px;"
            title="Naar rondebeheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" autofocus>
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </form>
      </td>
    </tr>
    <tr>
      <td height="30" colspan="2" align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>