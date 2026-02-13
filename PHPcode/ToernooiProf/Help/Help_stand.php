<?php
//© Hans Eekels, versie 22-06-2025
//Help bij Start toernooi ongedaan maken
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
			<td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij Stand</strong></td>
		</tr>
		<tr>
			<td height="203" align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
				<div style="margin-left:5px; margin-right:5px; margin-top:5px; margin-bottom:5px" ;>U kunt van elke poule, die u eerst even moet kiezen, de stand opvragen. Standaard wordt de stand getoond op volgorde van meeste punten, maar u kunt ervoor kiezen om dat te wijzigen in hoogste percentage punten. Dat heeft overigens alleen zin als spelers in een poule niet allemaal even veel partijen hebben gespeeld.
					<br><br>Bij de stand zelf is een helpknop beschikbaar waarbij het verschil in methode met een voorbeeld wordt uitgelegd.
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