<?php
//© Hans Eekels, versie 22-06-2025
//Help algemeen
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
			width: 500px;
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
	<table width="500" border="0">
		<tr>
			<td height="25" align="center" valign="middle" bgcolor="#003300"><strong>Help bij verwijderen van slides</strong></td>
		</tr>
		<tr>
			<td align="left" valign="top" bgcolor="#FFFFFF" class="zwart">
				<div style="margin:5px;">
					Bij het verwijderen van slides krijgt u een lijst van alle bestaande slides als thumbnail (klein formaat).<br>U kunt dan de slides aanvinken die u wilt verwijderen.<br><br>
					Tip: verwijder alleen slides als u zeker bent dat ze niet op dat moment op de scoreborden worden getoond.
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