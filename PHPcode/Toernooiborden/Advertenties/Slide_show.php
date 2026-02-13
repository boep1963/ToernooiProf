<?php
//© Hans Eekels, versie 22-06-2025
//Slide-show voor mededelingen of reclame
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../../ToernooiProf/PHP/Functies_toernooi.php');

/*
var_dump($_POST) geeft:
array(7) { 
[1]=> string(2) "on" 
[2] ontbreekt, dus afgevinkt
[3]=> string(2) "on" 
[4]=> string(2) "on" 
["seconden"]=> string(1) "5" 
["str_var"]=> string(256) "YTo0OntpOjE7YToxOntzOjQ6Im5hYW0iO3M6MTc6I...."
["user_code"]=> string(10) "1001_CHR@#"

["Cancel"]=> string(6) "Cancel" }
of
["Start"]=> string(5) "Start"
*/

$Bestanden = array();
$Slides = array();		//bestanden die aangevinkt zijn

$bAkkoord = TRUE;			//wordt FALSE bij verkeerde POST of verkeerde input
$error_message = "Verwachtte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";		//melding bij foute POST

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
			$Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
			if (file_exists($Logo_naam) == FALSE) {
				$Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_standaard.jpg";
			}
		}
	}
} else {
	$bAkkoord = FALSE;
}

if (!isset($_POST['toernooi_nr'])) {
	$bAkkoord = FALSE;
} else {
	$Toernooi_nr = intval($_POST['toernooi_nr']);
	if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
		$bAkkoord = FALSE;
	}
}

//doorsturen naar kies-optie als cancel doorgegeven
if (isset($_POST["Cancel"])) {
	//redirect naar Kies_optie.php met code en toernr
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta charset="UTF-8">
		<title>Redirect</title>
		<script type="text/javascript">
			window.onload = function() {
				document.forms[0].submit();
			}
		</script>
	</head>

	<body style="background-color:#333; margin:0;">
		<form method="post" action="../Kies_optie.php">
			<input type="hidden" name="user_code" value="<?php echo $Code; ?>">
			<input type="hidden" name="toernooi_nr" value="<?php echo $Toernooi_nr; ?>">
		</form>
	</body>

	</html>
<?php
	exit;
}

//verder
if (!isset($_POST['seconden'])) {
	$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";
	$bAkkoord = FALSE;
} else {
	$Aantal_seconden = $_POST['seconden'] * 1000;
}

if (!isset($_POST['str_var'])) {
	$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";
	$bAkkoord = FALSE;
} else {
	$str_var = $_POST["str_var"];
	$Bestanden = unserialize(base64_decode($str_var));	//alle doorgegeven slides
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
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<link href="../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
		<script src="../../ToernooiProf/PHP/script_toernooi.js" defer></script>
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
				<td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

/*
var_dump($Bestanden) geeft alle slides, ook die niet zijn aangevinkt, die afleiden uit checkboxes
array(18) { [1]=> array(1) { ["naam"]=> string(16) "klaverjassen.jpg" } [2]=> array(1) { ["naam"]=> string(12) "[000144].jpg" } [3]=> array(1) { ["naam"]=> string(13) "Reclame_1.jpg" } [4]=> array(1) { ["naam"]=> string(11) "Texel02.jpg" } [5]=> array(1) { ["naam"]=> string(25) "Eekels_bier_swinckels.jpg" } 
*/

//zoek slides die meedoen
$teller = 0;
for ($a = 1; $a < 21; $a++) {
	if (isset($_POST[$a])) {
		$teller++;
		$Slides[$teller]['naam'] = $Bestanden[$a]['naam'];
	}
}
$Aantal_slides = $teller;	//kan 0 zijn !!

if ($Aantal_slides == 0) {
?>
	<!DOCTYPE html>
	<html>

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Foutmelding</title>
		<link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
		<style type="text/css">
			body,
			td,
			th {
				font-family: Verdana;
				font-size: 12px;
				color: #FFF;
			}

			h1 {
				font-size: 24px;
			}

			body {
				background-color: #000;
				width: 400px;
				margin-top: 10px;
				margin-right: auto;
				margin-bottom: 0px;
				margin-left: auto;
			}
		</style>
	</head>

	<body>
		<table width="400" border="0">
			<tr>
				<td width="69" bgcolor="#000000">&nbsp;</td>
				<td width="321" bgcolor="#000000">&nbsp;</td>
			</tr>
			<tr>
				<td colspan="2" align="center" valign="middle">
					<h1>Foutmelding</h1>
				</td>
			</tr>
			<tr>
				<td height="25" colspan="2" align="center">
					<h4>Omschrijving van de fout(en)</h4>
				</td>
			</tr>
			<tr>
				<td height="139" colspan="2" align="center" valign="middle">
					U heeft geen enkele slide aangevinkt; een slide-show is dus niet mogelijk.<br>
					Ga terug naar het Beheersscherm.
				</td>
			</tr>
			<tr>
				<td height="35" colspan="2" align="center" bgcolor="#6CA524">
					<form name="cancel" method="post" action="../Kies_optie.php">
						<input type="submit" style="width:100px; height:30px;" title="Terug " value="OK">
						<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
						<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
					</form>
				</td>
			</tr>
		</table>
	</body>

	</html>
<?php
	exit;
}

//nu slideshow
?>
<!DOCTYPE html>
<html>

<head>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			font-family: Verdana, sans-serif;
		}

		.mySlides {
			display: none;
		}

		img {
			vertical-align: middle;
		}

		/* Slideshow container */
		.slideshow-container {
			max-width: 1900px;
			position: relative;
			margin: auto;
		}

		/* Caption text */
		.text {
			color: #f2f2f2;
			font-size: 15px;
			padding: 8px 12px;
			position: absolute;
			bottom: 8px;
			width: 100%;
			text-align: center;
		}

		/* Number text (1/3 etc) */
		.numbertext {
			color: #f2f2f2;
			font-size: 12px;
			padding: 8px 12px;
			position: absolute;
			top: 0;
		}

		/* The dots/bullets/indicators */
		.dot {
			height: 15px;
			width: 15px;
			margin: 0 2px;
			background-color: #bbb;
			border-radius: 50%;
			display: inline-block;
			transition: background-color 0.6s ease;
		}

		.active {
			background-color: #717171;
		}

		/* Fading animation */
		.fade {
			animation-name: fade;
			animation-duration: 1.5s;
		}

		@keyframes fade {
			from {
				opacity: .4
			}

			to {
				opacity: 1
			}
		}

		.center {
			display: block;
			margin-left: auto;
			margin-right: auto;
			width: 50%;
		}

		/* On smaller screens, decrease text size */
		@media only screen and (max-width: 300px) {
			.text {
				font-size: 11px
			}
		}
	</style>
</head>

<body>
	<div class="slideshow-container">
		<?php
		for ($b = 1; $b < $Aantal_slides + 1; $b++) {
			$Img = $Bestanden[$b]['naam'];		//"Reclame_1.jpg"	  
			$Pad = "../../ToernooiProf/Beheer/slideshow/" . $Img;
		?>
			<div class="mySlides fade">
				<img src="<?php print("$Pad"); ?>" style="width:1800px; height:900px;" class="center">
			</div>
		<?php
		}
		?>
	</div>
	<br>
	<div style="text-align:center">
		<?php
		for ($c = 1; $c < $Aantal_slides + 1; $c++) {
		?>
			<span class="dot"></span>
		<?php
		}
		?>
	</div>
	<div style="text-align:center">
		<form name="terug" method="post" action="../Kies_optie.php">
			<input type="submit" style="width:200px; height:50px; background-color:#060; color:#FFF;" id="stop" value="Stop">
			<input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
			<input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
		</form>
	</div>

	<script>
		var seconden = <?php echo $Aantal_seconden; ?>;
		var aantalslides = <?php echo $Aantal_slides; ?>;

		let slideIndex = -1; // Begin de index bij -1 in plaats van 0
		let slideTimeout;

		// Functie om de automatische diavoorstelling te starten
		function startSlides() {
			showSlides();
		}

		// Functie om de dia's te tonen
		function showSlides() {
			let i;
			let slides = document.getElementsByClassName("mySlides");
			let dots = document.getElementsByClassName("dot");
			for (i = 0; i < aantalslides; i++) {
				slides[i].style.display = "none";
			}
			slideIndex++;
			if (slideIndex >= aantalslides) {
				slideIndex = 0
			} // Reset index naar 0 als einde wordt bereikt   
			for (i = 0; i < aantalslides; i++) {
				dots[i].className = dots[i].className.replace(" active", "");
			}
			slides[slideIndex].style.display = "block";
			dots[slideIndex].className += " active";
			slideTimeout = setTimeout(showSlides, seconden); // Verander afbeelding elke x seconden
		}

		// Functie om de automatische diavoorstelling te stoppen
		function stopSlides() {
			clearTimeout(slideTimeout); // Stop de time-out
		}

		// Eventlistener voor de stopknop
		document.getElementById("stop").addEventListener("click", stopSlides);

		// Start de automatische diavoorstelling wanneer de pagina laadt
		window.onload = startSlides;
	</script>
</body>

</html>