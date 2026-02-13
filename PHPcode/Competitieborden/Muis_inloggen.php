<?php
//© Hans Eekels, versie 13-07-2025
//Met muis inloggen voor ClubMatch Online
?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Inloggen ClubMatch Online</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
	<meta name="Description" content="ClubMatch" />
	<link rel="shortcut icon" href="eekels.ico" type="image/x-icon" />
	<link rel="stylesheet" href="Scoreborden/Remote/Media.css">
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
	<form name="inloggen" method="post" action="Start.php">
		<table style="width:100%;" border="0" bgcolor="#003300">
			<tr>
				<td style="width:15%">
					<img src="../Figuren/Logo_CM.jpg" class="logo-afbeelding" alt="ClubMatch">
				</td>
				<td align="center">
					<h1>Inloggen ClubMatch Online voor Scorebord-bediening<br>via de muis</h1>
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
					<input type="button" class="cancel-button" onClick="location='../Start.php'" title="Terug" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
				</td>
				<td align="center">
					<input type="submit" class="wissel-button" value="Inloggen" title="Naar ClubMatch Online"
						onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
				</td>
			</tr>
		</table>
	</form>
</body>

</html>