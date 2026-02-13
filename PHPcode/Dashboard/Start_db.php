<?php
//Startpagina Dashboard Hans Eekels, versie 04-01-2026
//naar keuze sortering bij CM en TP

//pagina
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Dashboard</title>
<meta name="Keywords" content="Hans Eekels" />
<meta name="description" content="Portal" />
<link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
<link href="../Stijlen/Stijlen_algemeen.css" rel="stylesheet" type="text/css" />
<style type="text/css">
body {
	width: 850px;
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
<table width="850" border="0">
  <tr>
    <td width="311" height="40" align="center" bgcolor="#FF6600"><strong>Hosting</strong></td>
    <td width="111" bgcolor="#FF6600">&nbsp;</td>
    <td width="311" align="center" bgcolor="#FF6600"><strong>Toegang Dashboard/programma's</strong></td>
    <td width="111" bgcolor="#FF6600">&nbsp;</td>
  </tr>
  <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>Mijn Antagonist</strong></td>
    <td align="center" valign="middle" bgcolor="#003300">
    <input type="button" onClick="window.open('https://mijn.antagonist.nl/accounts/login/?next=/', '_blank');" value="Kies" />
    </td>
    <td align="center" valign="middle" bgcolor="#003300"><strong>ClubMatch Dashboard</strong></td>
    <td align="center" valign="middle" bgcolor="#003300">
    <input type="button" onClick="window.location.href='ClubMatch_start.php';" value="Kies" />
    </td>
  </tr>
  <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>DirectAdmin</strong></td>
    <td align="center" valign="middle" bgcolor="#003300">
    <input type="button" onClick="window.open('https://s250.webhostingserver.nl:2223/', '_blank');" value="Kies" />
    </td>
    <td align="center" valign="middle" bgcolor="#003300"><strong>ToernooiProf Dashboard</strong></td>
    <td align="center" valign="middle" bgcolor="#003300">
    <input type="button" onClick="window.location.href='ToernooiProf_start.php';" value="Kies" />
    </td>
  </tr>
  <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>Webmail info@</strong></td>
    <td align="center" valign="middle" bgcolor="#003300"><input type="button" onClick="window.open('https://mail.antagonist.nl/', '_blank');" value="Kies" /></td>
    <td align="center" valign="middle" bgcolor="#003300"><strong>TeamSpecial Programma</strong></td>
    <td align="center" valign="middle" bgcolor="#003300">
    <input type="button" onClick="window.open('../TeamSpecial/Start.php','_blank');" value="Kies" />
    </td>
  </tr>
  <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>Statistieken SpecialSoftware</strong></td>
    <td align="center" valign="middle" bgcolor="#003300"><input type="button" 
    onClick="window.open('https://s250.webhostingserver.nl:2223/evo/user/stats/specialsoftware.nl/statistics/webalizer', '_blank');" value="Kies" /></td>
    <td align="center" valign="middle" bgcolor="#003300"><strong>VG-Biljarten Beheer</strong></td>
    <td align="center" valign="middle" bgcolor="#003300">
    <input type="button" onClick="window.open('https://www.vg-biljarten.nl/Beheer/Start_beheer.php', '_blank');" value="Kies" />
    </td>
  </tr>
   <tr>
    <td height="40" colspan="2" align="center" valign="middle" bgcolor="#003300"><strong>Beheer Nieuws</strong></td>
    <td height="40" colspan="2" align="center" valign="middle" bgcolor="#003300"><strong>Beheer Reacties</strong></td>
  </tr>
   <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>Bericht aanmaken</strong></td>
    <td align="center" valign="middle" bgcolor="#003300"><input type="button" onClick="window.open('Nieuws_start.php');" value="Kies" /></td>
    <td align="center" valign="middle" bgcolor="#003300">&nbsp;</td>
    <td align="center" valign="middle" bgcolor="#003300">&nbsp;</td>
  </tr>
   <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>Bericht aanpassen</strong></td>
    <td align="center" valign="middle" bgcolor="#003300"><input type="button" onClick="window.open('#');" value="Kies" /></td>
    <td align="center" valign="middle" bgcolor="#003300"><strong>Reactie aanpassen</strong></td>
    <td align="center" valign="middle" bgcolor="#003300">
    <input type="button" onClick="window.open('Reactie_aanpassen.php');" value="Kies" />
    </td>
  </tr>
   <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>Bericht verwijderen</strong></td>
    <td align="center" valign="middle" bgcolor="#003300"><input type="button" onClick="window.open('');" value="Kies" /></td>
    <td align="center" valign="middle" bgcolor="#003300"><strong>Reactie verwijderen</strong></td>
    <td align="center" valign="middle" bgcolor="#003300">
    <input type="button" onClick="window.open('Reactie_delete.php');" value="Kies" />
    </td>
  </tr>
  <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300">&nbsp;</td>
    <td align="center" valign="middle" bgcolor="#003300">&nbsp;</td>
    <td align="center" valign="middle" bgcolor="#003300">&nbsp;</td>
    <td align="center" valign="middle" bgcolor="#003300">&nbsp;</td>
  </tr>
  <tr>
    <td height="40" align="center" valign="middle" bgcolor="#003300"><strong>Naar homepage hanseekels.nl</strong></td>
    <td align="center" bgcolor="#003300">
    <input type="button" onClick="window.open('https://www.hanseekels.nl');" value="Kies" />
    </td>
    <td align="center" valign="middle" bgcolor="#003300"><strong>Naar homepage specialsoftware.nl</strong></td>
    <td align="center" valign="middle" bgcolor="#003300"><input type="button" onClick="window.open('https://www.specialsoftware.nl');" value="Kies" /></td>
  </tr>
  </table>
</body>
</html>
