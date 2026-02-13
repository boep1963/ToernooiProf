<?php
//Startpagina ClubMatch dashboard 04-01-2026

//pagina
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>ClubMatch keuze</title>
<meta name="Keywords" content="Hans Eekels" />
<meta name="description" content="Portal" />
<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
<link href="../Stijlen/Stijlen_algemeen.css" rel="stylesheet" type="text/css" />
<style type="text/css">
body {
	width: 425px;
	margin-top:50px;
}
input[type=submit] {
  	height:30px;
   	width:90px;
}
input[type=button] {
   	height: 30px;
   	width: 90px;
}
</style>
</head>
<body>
<form name="clubmatch" method="post" action="ClubMatch_dashboard.php" >
<table width="425" border="0">
  <tr>
    <td height="40" colspan="2" align="center" bgcolor="#FF6600"><strong>Kies sortering overzicht ClubMatch</strong></td>
  </tr>
  <tr>
    <td width="300" height="40" align="center" valign="middle" bgcolor="#003300"><strong>Op nummer</strong></td>
    <td align="center" valign="middle" bgcolor="#003300"><input type="submit" name="nummer" value="Kies" /></td>
  </tr>
  <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>Op email</strong></td>
    <td align="center" valign="middle" bgcolor="#003300"><input type="submit" name="email" value="Kies" /></td>
  </tr>
  <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>Op inactiviteit</strong></td>
    <td align="center" valign="middle" bgcolor="#003300"><input type="submit" name="inactief" value="Kies" /></td>
  </tr>
  <tr>
    <td height="20" colspan="2" bgcolor="#003300">&nbsp;</td>
  </tr>
  <tr>
    <td height="40" colspan="2" align="center" valign="middle" bgcolor="#003300">
    <a href="Start_db.php" target="_self">
        <input type="button" style="width:150px; height:35px; background-color:#000; color:#FFF; font-size:16px;" value="Cancel"
            onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
    </a>
    </td>
  </tr>
</table>
</form>
</body>
</html>
