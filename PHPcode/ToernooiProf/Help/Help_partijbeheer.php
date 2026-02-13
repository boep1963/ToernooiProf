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
			<td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij Partij-beheer</strong></td>
		</tr>
		<tr>
			<td height="218" align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
				<div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px" ;>
					Via de knop "Uitslagen/Partijen" komt u, na keuze van de gewenste poule, op de pagina Planning, waarop alle partijen staan die door het programma zijn gegenereerd op basis van het aantal spelers in de getoonde poule.<br><br>
					Op deze pagina kunt u ook handmatig uitslagen invoeren of wijzigen, maar als u gebruik maakt van electronische scoreborden, dan kunt u hier ook die partijen aan die borden koppelen, waarna de behaalde resultaten van een partij automatisch in dit programma worden verwerkt.
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