<?php
//© Hans Eekels, versie 14-12-2025
//Nieuwe speler aanmaken
//toegevoegd: car bij ingevoerd moyenne
//moy-form uitgebreid
//car_sys toegevoegd
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../PHP/Functies_toernooi.php');
$Copy = Date("Y");

/*
var_dump($_POST) geeft:
array(2) { 
["t_nummer"]=> string(1) "1" 
["user_code"]=> string(10) "1000_KYZ@#" }
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

if (count($_REQUEST) != 2) {
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

//verder
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
$Car_sys = fun_carsys($Gebruiker_nr, $Toernooi_nr, $Path);

//haal data op voor moy-formule in js
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

	//close connection
	mysqli_close($dbh);
} catch (Exception $e) {
	echo $e->getMessage();
}

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Speler invoeren</title>
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
  <form name="nieuw" method="post" action="Spelers_nieuw02.php">
    <table width="700" border="0">
      <tr>
        <td width="256" height="75" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
        <td width="434" align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <h2>ToernooiProf Online</h2>
          <strong><?php print("$Gebruiker_naam"); ?></strong>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="center" valign="middle" bgcolor="#006600" class="grootwit">
          <strong><?php print("$Toernooi_naam"); ?></strong>
        </td>
      </tr>
      <tr>
        <td colspan="2" height="40" align="center" valign="middle" bgcolor="#006600">
          <h1>Speler invoeren</h1>
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Voor- en achternaam</td>
        <td align="left" valign="middle" bgcolor="#009900" class="groot">
          <input type="text" name="naam" style="font-size:16px"; size="30" minlength="5" maxlength="25" required tabindex="1" autofocus>
          &nbsp;(min 5, max 25 tekens)
        </td>
      </tr>
      <tr>
        <td height="80" align="left" valign="middle" bgcolor="#009900" class="grootwit">
        <?php
		if ($Car_sys == 1)
		{
			?>
            <div style="margin:5px;">
            Voer Moyenne in (gebruik punt als komma);  aantal te maken car wordt getoond op basis van gekozen moyenne-formule
            </div>
            <?php
		}
		else
		{
			?>
            <div style="margin:5px;">
            Voer Moyenne in (gebruik punt als komma) en aantal te maken caramboles
            </div>
        	<?php
		}
        ?>
        </td>
        <td align="left" valign="middle" bgcolor="#009900" class="groot">
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
            pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="0.000" tabindex="2" required/>
            </td>
            <td>
            <input type="text" id="Car" name="Car" size="5" value="0" style="font-size:16px"; readonly />
            </td>
			<?php
		}
		else
		{
			?>
            <td>
            <input type="text" onClick="this.select();" id="Moyenne" name="Moyenne" maxlength="7" size="5" style="font-size:16px";
            pattern="[0-9]+(\.[0-9]{3})" title="Moyenne met 3 decimalen na de punt" value="0.000" tabindex="2" required />
            </td>
            <td>
            <input type="text" onClick="this.select();" id="Car" name="Car" size="5" min="<?php print("$Car_min"); ?>" value="0" style="font-size:16px"; pattern="[0-9]+" required />
            </td>
			<?php
		}
        ?>
        </tr>
        </table>
        </td>
      </tr>
      <tr>
        <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit">&nbsp;Kies start-poule</td>
        <td align="left" valign="middle" bgcolor="#009900" class="groot">
          <select name="poule_nr" tabindex="3" style="font-size:16px";>
            <option value="1" selected>Poule 1</option>
            <option value="2">Poule 2</option>
            <option value="3">Poule 3</option>
            <option value="4">Poule 4</option>
            <option value="5">Poule 5</option>
            <option value="6">Poule 6</option>
            <option value="7">Poule 7</option>
            <option value="8">Poule 8</option>
            <option value="9">Poule 9</option>
            <option value="10">Poule 10</option>
            <option value="11">Poule 11</option>
            <option value="12">Poule 12</option>
            <option value="13">Poule 13</option>
            <option value="14">Poule 14</option>
            <option value="15">Poule 15</option>
            <option value="16">Poule 16</option>
            <option value="17">Poule 17</option>
            <option value="18">Poule 18</option>
            <option value="19">Poule 19</option>
            <option value="20">Poule 20</option>
            <option value="21">Poule 21</option>
            <option value="22">Poule 22</option>
            <option value="23">Poule 23</option>
            <option value="24">Poule 24</option>
            <option value="25">Poule 25</option>
          </select>
          &nbsp;(Maak uw keuze)
        </td>
      </tr>
      <tr>
        <td colspan="2" height="70" align="center" bgcolor="#009900">
          <input type="submit" class="submit-button" value="Maak speler aan" tabindex="4" style="width:220px; height:60px; background-color:#000; color:#FFF; font-size:16px;"
            title="Maak speler aan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </td>
      </tr>
    </table>
  </form>
  <form name="cancel" method="post" action="../Spelers_Beheer.php">
    <table width="700">
      <tr>
        <td width="256" height="45" align="center" bgcolor="#006600">
          <input type="submit" class="submit-button" value="Cancel" tabindex="5" style="width:150px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
            title="Terug naar beheer spelers" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
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