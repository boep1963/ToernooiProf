<?php
//© Hans Eekels, versie 22-06-2025
//Help bij uitslagen
$Copy = Date("Y");

//verder
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Help</title>
	<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
	<style type="text/css">
		body,
		td,
		th {
			font-family: Verdana;
			font-size: 14px;
			color: #FFF;
		}

		h1 {
			font-size: 24px;
		}

		h2 {
			font-size: 16px;
		}

		body {
			background-color: #000;
			margin-top: auto;
			margin-right: auto;
			margin-bottom: auto;
			margin-left: auto;
			width: 360px;
		}

		input[type=button] {
			height: 30px;
			width: 100px;
			background-color: #CCC;
			color: #000;
		}

		.zwart {
			font-size: 14px;
			color: #000;
		}

		.submit-button {
			border: 2px solid transparent;
			cursor: pointer;
		}

		.submit-button:hover {
			border-color: #FFF;
		}
	</style>
</head>

<body>
	<table width="365" border="0">
		<tr>
			<td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij Partijen aanmaken</strong></td>
		</tr>
		<tr>
			<td height="250" align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
				<div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px" ;>
					Spelers in een Poule moeten wedstrijden tegen elkaar spelen. U kunt op <strong>twee</strong> manieren bepalen wie de wedstrijd-indeling voor zijn rekening neemt:<br>
					1) Door de indeling van alle partijen handmatig te bepalen en na afloop van een partij de uitslag daarvan ook handmatig in het programma in te voeren. U gebruikt deze knop &quot;Partijen aanmaken&quot; dan niet.<br>
					2) Door de partij-indeling door het programma te laten bepalen. U gebruikt de knop &quot;Partijen aanmaken&quot; hiernaast dan wel. U hoeft dan alleen aan te geven hoeveel partijen elke speler moet spelen in deze ronde. NB: als u werkt met electronische scoreborden, dan worden de uitslagen van partijen automatisch door het programma verwerkt; anders moet u nog wel uitslagen handmatig invoeren.
				</div>
			</td>
		</tr>
		<tr>
			<td height="32" align="center" bgcolor="#FFFFFF">
				<input type="button" value="Sluit Help" onClick="self.close()">
			</td>
		</tr>
	</table>
</body>

</html>