<?php
//© Hans Eekels, versie 17-12-2025
//Speler wijzigen
//Car_sys toegevoegd
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');

$Copy = Date("Y");
/*
var_dump($_POST) geeft:
array(3) { ["speler_nr"]=> string(1) "3" ["user_code"]=> string(10) "1001_CHR@#" ["t_nummer"]=> string(1) "1" }
*/

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

if (!isset($_POST['speler_nr'])) {
  $bAkkoord = FALSE;
} else {
  $Speler_nr = $_POST['speler_nr'];
  if (filter_var($Speler_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (count($_REQUEST) != 3) {
  $bAkkoord = FALSE;
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

$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
$Nieuwe_ronde = $Huidige_ronde + 1;
$Car_sys = fun_carsys($Gebruiker_nr, $Toernooi_nr, $Path);

//haal speler op
try {
  	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");
	
	$sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr'";

	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}

	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
		$Moy_form = $resultaat['t_moy_form'];	//kan 0 zijn bij $Car_sys == 2
		$Car_min = $resultaat['t_min_car'];
	}
  
    $sql = "SELECT * FROM tp_poules WHERE gebruiker_nr = '$Gebruiker_nr' AND t_nummer = '$Toernooi_nr' AND sp_nummer = '$Speler_nr' AND ronde_nr = '$Nieuwe_ronde'";

    $res = mysqli_query($dbh, $sql);
    if (!$res) {
      throw new Exception(mysqli_error($dbh));
    }

    while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
      $Moy = $resultaat['sp_moy'];
	  $Car = $resultaat['sp_car'];
      $Naam = fun_spelersnaam($Gebruiker_nr, $Toernooi_nr, $Speler_nr, $Path);
      $Poule_nr = $resultaat['poule_nr'];
    }

  //close connection
  mysqli_close($dbh);
} catch (Exception $e) {
  echo $e->getMessage();
}

//pagina
?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Speler wijzigen</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
  <link href="../PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="../PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 700px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
  <script>
	const Moy_form = <?php echo (int)$Moy_form; ?>;
	const Car_min  = <?php echo (int)$Car_min; ?>;
  </script>
</head>

<body>
  <table width="700" border="0">
    <tr>
      <td width="256" height="105" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
      <td width="434" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <h1>ToernooiProf Online</h1>
        <strong><?php print("$Gebruiker_naam"); ?></strong>
      </td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong><?php print("$Toernooi_naam"); ?></strong></td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><strong>Speler wijzigen</strong></td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <strong>U werkt nu in ronde <?php print("$Huidige_ronde"); ?> en u gaat ronde <?php print("$Nieuwe_ronde"); ?> aanmaken</strong>
      </td>
    </tr>
    <td height="40" colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit">
      <strong>Gekozen speler <?php print("$Naam"); ?> </strong>
    </td>
    </tr>

    <tr>
      <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit"><br>
        NB: als u deze speler niet wilt koppelen naar de volgende ronde,<br>
        selecteer dan "Niet koppelen" boven in de poule-lijst.
      </td>
    </tr>
    <tr>
      <td height="40" colspan="2" align="center" valign="middle" bgcolor="#009900" class="grootwit">
        <form name="kies" method="post" action="Spelers_wijzigen03.php">
          <table width="700" border="0">
            <tr>
            <?php  
            if ($Car_sys == 1)
			{
              ?>
			  <td height="50" width="430" align="center" class="grootwit"><strong>Wijzig eventueel het moyenne</strong></td>
              <?php
			}
			else
			{
			  ?>
			  <td height="50" width="430" align="center" class="grootwit"><strong>Wijzig eventueel moyenne en/of car</strong></td>
              <?php	
			}
            ?> 
              <td align="center" class="grootwit"><strong>Wijzig eventueel de poule</strong></td>
            </tr>
            <tr>
              <td height="50" align="center">
              <table width="430" border="0">
             	<tr>
                	<td width="99" class="grootwit">Moyenne</td>
                	<td width="321" class="grootwit">Aantal te maken caramboles</td>
            	</tr>
            <tr>
            <?php	
            if ($Car_sys == 1)
            {
                ?>
                <td>
                <input type="text" onClick="this.select();" oninput="fun_car();" id="Moyenne" name="Moyenne" maxlength="7" size="5" style="font-size:16px";
                pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="<?php print("$Moy"); ?>" tabindex="2" required/>
                </td>
                <td>
                <input type="text" id="Car" name="Car" size="5" value="<?php print("$Car"); ?>" style="font-size:16px"; readonly />
                </td>
                <?php
            }
			else
			{
				?>
				<td>
				<input type="text" onClick="this.select();" id="Moyenne" name="Moyenne" maxlength="7" size="5" style="font-size:16px";
				pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="<?php print("$Moy"); ?>" tabindex="2" required />
				</td>
				<td>
				<input type="text" id="Car" name="Car" size="5" min="<?php print("$Car_min"); ?>" value="<?php print("$Car"); ?>" style="font-size:16px"; required />
				</td>
				<?php
			}
			?>
			</tr>
			</table>
              </td>
              <td align="center">
                <select name="poule_nr">
                  <option value="0">Niet koppelen</option>
                  <?php
                  for ($a = 1; $a < 26; $a++) {
                    if ($a == $Poule_nr) {
                  ?>
                      <option value="<?php print("$a"); ?>" selected><?php print("Poule $a"); ?></option>
                    <?php
                    } else {
                    ?>
                      <option value="<?php print("$a"); ?>"><?php print("Poule $a"); ?></option>
                  <?php
                    }
                  }
                  ?>
                </select>
              </td>
            </tr>
            <tr>
              <td height="80" colspan="2" align="center" valign="middle">
                <input type="submit" class="submit-button" value="Akkoord" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
                  title="Wijzig poule" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
                <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
                <input type="hidden" name="speler_nr" value="<?php print("$Speler_nr"); ?>">
              </td>
            </tr>
          </table>
        </form>
      </td>
    </tr>
  </table>
  <form name="cancel" method="post" action="Ronde_nieuw01.php">
    <table width="700">
      <tr>
        <td width="256" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" value="Cancel" tabindex="5" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
            title="Terug naar rondebeheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
        </td>
        <td align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </form>
<script>
	function fun_car() {
		const Moy = parseFloat(document.getElementById("Moyenne").value.replace(',', '.'));
		const veld = document.getElementById("Car");
	
		if (isNaN(Moy)) {
			veld.value = "";
			return;
		}
	
		let Car;
	
		switch (Moy_form) {
			case 1: Car = Math.round(Moy * 20); break;
			case 2: Car = Math.round(Moy * 25); break;
			case 3: Car = Math.round(Moy * 30); break;
			case 4: Car = Math.round(Moy * 40); break;
			case 5: Car = Math.round(Moy * 50); break;
			case 6: Car = Math.round(Moy * 60); break;
			default: Car = Math.round(Moy * 25); break;
		}
	
		if (Car < Car_min) Car = Car_min;
	
		veld.value = Car;
	}
</script>
</body>

</html>