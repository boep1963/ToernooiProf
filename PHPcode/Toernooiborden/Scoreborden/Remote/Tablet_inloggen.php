<?php
//© Hans Eekels, versie 13-07-2025
//Tablet/mobiel inloggen voor ToernooiProf Online

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Inloggen ToernooiProf Online</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ToernooiProf" />
	<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
	<link rel="stylesheet" href="Media.css">
	<script>
		function mouseInBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "#F00";
		}

		function mouseOutBut(event) {
			var button = event.target || event.srcElement;
			button.style.borderColor = "transparent";
		}
	</script>
</head>

<body onContextMenu="return false">
	<form name="inloggen" method="post" action="Tablet_keuze_comp.php">
		<table style="width:100%;" border="0" bgcolor="#003300">
			<tr>
				<td style="width:15%">
					<img src="../../../Figuren/Logo_TP.jpg" class="logo-afbeelding" alt="ToernooiProf">
				</td>
				<td align="center">
					<h1>Inloggen ToernooiProf Online voor Scorebord-bediening<br>via tablet of smartphone</h1>
				</td>
			</tr>
			<tr>
				<td>&nbsp;</td>
				<td align="center">(vraag de inlog-code aan uw Wedstrijdleider)</td>
			<tr>
			<tr>
				<td>&nbsp;</td>
				<td align="center">
					<input type="password" name="user_code" minlength="10" maxlength="10" size="12" style="font-size:24px">
				</td>
			</tr>
			<tr>
				<td colspan="2" height="30">&nbsp;</td>
			</tr>
			<tr>
				<td align="center">
					<input type="button" class="cancel-button" onClick="location='../../../Start.php'" title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
				</td>
				<td align="center">
					<input type="submit" class="wissel-button" value="Inloggen" title="Naar ToernooiProf Online"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
			</tr>
		</table>
	</form>
</body>

</html>