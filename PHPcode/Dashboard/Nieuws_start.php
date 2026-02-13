<?php
//&copy; Hans Eekels, versie 18-04-2025
//Nieuwsbericht maken

require_once('../Functies/Functies.php');

//Timestamp
//2024-01-28 15:40:00
$Tijd = Date("Y-m-d H:i:s");
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Newsfeed</title>
<meta name="Keywords" content="Hans Eekels" />
<meta name="description" content="Portal" />
<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
<link href="../Stijlen/Stijlen_algemeen.css" rel="stylesheet" type="text/css" />
<style type="text/css">
body {
	width: 600px;
	margin-top: 10px;
}
input[type=submit] {
  	height:30px;
   	width:150px;
}
input[type=button] {
   	height: 30px;
   	width: 120px;
}
.anders {
height: 100px;
width: 550px;
font-family: verdana;
font-size: 12pt;
color: black;
}
</style>
</head>
<body>
<form name="bericht" method="post" action="Nieuws_opslaan.php">
<table width="600" border="0">
  <tr>
    <td height="42" colspan="2" align="center" bgcolor="#333333" class="groot"><strong>Newsfeed plaatsen (max 500)</strong></td>
  </tr>
  <tr>
    <td width="104" height="26" align="center" valign="middle" bgcolor="#FFFFCC" class="zwart">Timestamp:</td>
    <td width="486" align="left" valign="middle" bgcolor="#FFFFCC" class="zwart">
    <?php print("$Tijd"); ?>
    </td>
  </tr>
  <tr>
    <td width="104" height="26" align="center" valign="middle" bgcolor="#FFFFCC" class="zwart">
    Kop *</td>
    <td width="486" align="left" valign="middle" bgcolor="#FFFFCC" class="zwart">
    <input type="text" name="kop" maxlength="30" minlength="3" size="25" required tabindex="1" >
    </td>
  </tr>
  <tr>
    <td height="40" colspan="2" align="center" valign="top" bgcolor="#FFFFCC">
    <TEXTAREA name="nieuws" rows="10" cols="70" maxlength="1000" minlength="3" required wrap="hard" tabindex="2"></TEXTAREA>
    </td>
  </tr>
  <tr>
    <td height="40" colspan="2" align="center" valign="middle" bgcolor="#FFFFCC">
      <input type="submit" value="Nieuws verzenden">
    </td>
  </tr>
  <tr>
    <td height="40" align="left">
    <input type="button" style="width:100px; background-color:#000; color:#FFF;" onClick="window.location.href='Start_db.php';" value="Terug" /></td>
    <td align="center">&nbsp;(Met de knop Terug wordt  de newsfeed niet opgeslagen) </td>
  </tr>
  <tr>
    <td height="20" align="left" valign="middle" bgcolor="#333333">
	<input type="hidden" name="tijd" value="<?php print("$Tijd"); ?>">
    </td>
    <td align="left" valign="middle" bgcolor="#333333">&nbsp;</td>
  </tr>
</table>
</form>
</body>
</html>
