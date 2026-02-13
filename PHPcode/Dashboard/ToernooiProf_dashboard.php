<?php
//Startpagina Dashboard ToernooiProf, versie 01-01-2026
//sorteren op inactiviteit en kleur rood bij reminder_send = 1
require_once('../../data/connectie_toernooiprof.php');

if (isset($_POST['nummer']))
{
	$Keuze = 1;		//op nummer
	$Naam_hulp = "Org_nummer";
}
if (isset($_POST['email']))
{
	$Keuze = 2;		//op email
	$Naam_hulp = "email wl";
}
if (isset($_POST['inactief']))
{
	$Keuze = 3;		//op dagen inactief
	$Naam_hulp = "dagen inactief";
}

$Accounts = array();
$Datum_huidig = date('Y-m-d');
$Datum_nu = new DateTime($Datum_huidig);

try {
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh) {
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");
	
	if ($Keuze == 1)	//sorteren op nummer
	{	
		$sql = "SELECT * FROM tp_gebruikers ORDER BY gebruiker_nr";
	}
	if ($Keuze == 2)	//sorteren op email
	{	
		$sql = "SELECT * FROM tp_gebruikers ORDER BY tp_wl_email";
	}
	if ($Keuze == 3)	//sorteren op dagen inactief
	{	
		$sql = "SELECT * FROM tp_gebruikers ORDER BY date_inlog";
	}
	
	$res = mysqli_query($dbh, $sql);
	if (!$res) {
		throw new Exception(mysqli_error($dbh));
	}
		
		if (mysqli_num_rows($res) == 0) {
			$Aantal_accounts = 0;
		} else {
			$teller = 0;
			while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
				$teller++;
				$Accounts[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
				$Accounts[$teller]['gebruiker_code'] = $resultaat['gebruiker_code'];
				$Accounts[$teller]['gebruiker_naam'] = $resultaat['gebruiker_naam'];
				$Accounts[$teller]['wl_naam'] = $resultaat['tp_wl_naam'];
				$Accounts[$teller]['email'] = $resultaat['tp_wl_email'];
				$Accounts[$teller]['nieuwsbrief'] = $resultaat['nieuwsbrief'];
				$Datum_hulp = $resultaat['date_inlog'];
				if (!empty($Datum_hulp)) {
					try {
						$Datum_inlog = new DateTime($Datum_hulp);
						$verschil = $Datum_nu->diff($Datum_inlog);
						$Aantal_dagen = $verschil->days;
					} catch (Exception $e) {
						$Aantal_dagen = '-';
					}
				} else {
					$Aantal_dagen = '-';
				}
				$Accounts[$teller]['inactief'] = $Aantal_dagen;
				$Accounts[$teller]['reminder_send'] = $resultaat['reminder_send'];
				$Accounts[$teller]['aantal_toer'] = 0;	//hierna vullen
			}
			$Aantal_accounts = $teller;
		}
		
		if ($Aantal_accounts > 0)
		{
			for ($a = 1; $a < $Aantal_accounts + 1; $a++)
			{
				$Gebruiker_nr = $Accounts[$a]['gebruiker_nr'];
				$sql = "SELECT * FROM tp_data WHERE gebruiker_nr = '$Gebruiker_nr'";

				$res = mysqli_query($dbh, $sql);
				if (!$res) {
					throw new Exception(mysqli_error($dbh));
				}
		
				$Accounts[$a]['aantal_toer'] = mysqli_num_rows($res);
			}
		}
		
		//close connection
		mysqli_close($dbh);
	} catch (Exception $e) {
		echo $e->getMessage();
	}

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
	width: 1000px;
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
div.scroll {
	background-color: #FFF;
	width: 980px;
	height: 500px;
	overflow: auto;
}
</style>
<script type="text/javascript">
function printDiv(divName) {
	var printContents = document.getElementById(divName).innerHTML;
	var originalContents = document.body.innerHTML;
	document.body.innerHTML = printContents;
	window.print();
	document.body.innerHTML = originalContents;
}
function mouseInBut(event) {
  var button = event.target || event.srcElement;
  button.style.borderColor = "#FFF";
}
function mouseOutBut(event) {
  var button = event.target || event.srcElement;
  button.style.borderColor = "transparent";
}
</script>
</head>
<body>

<table width="1000" border="0">
<tr>
	<td valign="top" colspan="2">
    <div class="scroll">
	<div id="printableArea">
  	<table width="960" border="1">
    	<tr>
        	<td colspan="8" align="center" bgcolor="#FFFFFF" class="zwart">
            <strong><?php print("Accounts ToernooiProf Online [$Datum_huidig] gesorteerd op $Naam_hulp")?></strong>
            </td>
        <tr>
    	<tr>
        	<td width="60" height="30" align="center" bgcolor="#FFFFFF" class="zwart"><strong>Org_nr</strong></td>
        	<td width="80" align="center" bgcolor="#FFFFFF" class="zwart"><strong>Code</strong></td>
            <td width="171" align="center" bgcolor="#FFFFFF" class="zwart"><strong>Naam_org</strong></td>
            <td width="160" align="center" bgcolor="#FFFFFF" class="zwart"><strong>Naam_wl</strong></td>
            <td width="178" align="center" bgcolor="#FFFFFF" class="zwart"><strong>E-mail</strong></td>
             <td width="60" align="center" bgcolor="#FFFFFF" class="zwart"><strong>Nwsb ?</strong></td>
            <td width="60" align="center" bgcolor="#FFFFFF" class="zwart"><strong># toer</strong></td>
            <td width="93" align="center" bgcolor="#FFFFFF" class="zwart"><strong>Inactief (d)</strong></td>
        </tr>
        <?php
		if ($Aantal_accounts > 0)
		{
			for ($a = 1; $a < $Aantal_accounts + 1; $a++)
			{
				$Gebruiker_nr = $Accounts[$a]['gebruiker_nr'];
				$Code = $Accounts[$a]['gebruiker_code'];
				$Org_naam = $Accounts[$a]['gebruiker_naam'];
				$WL_naam = $Accounts[$a]['wl_naam'];
				$Email = $Accounts[$a]['email'];
				if ($Accounts[$a]['nieuwsbrief'] == 0)
				{
					$Nieuws_brief = "Nee";
				}
				else
				{
					$Nieuws_brief = "Ja";
				}
				$Aantal_toer = $Accounts[$a]['aantal_toer'];
				$Inactief = $Accounts[$a]['inactief'];
				$Reminder_send = $Accounts[$a]['reminder_send'];
				?>
				<tr>
					<td height="30" align="center" bgcolor="#FFFFFF" class="zwart"><?php print("$Gebruiker_nr"); ?></td>
					<td align="center" bgcolor="#FFFFFF" class="zwart"><?php print("$Code"); ?></td>
					<td align="center" bgcolor="#FFFFFF" class="zwart"><?php print("$Org_naam"); ?></td>
					<td align="center" bgcolor="#FFFFFF" class="zwart"><?php print("$WL_naam"); ?></td>
					<td align="center" bgcolor="#FFFFFF" class="zwart"><?php print("$Email"); ?></td>
                    <td align="center" bgcolor="#FFFFFF" class="zwart"><?php print("$Nieuws_brief"); ?></td>
                    <?php
					if ($Aantal_toer == 0)
					{
						?>
                        <td align="center" bgcolor="#FF0000" class="wit"><?php print("$Aantal_toer"); ?></td>
                    	<?php
					}
					else
					{
						?>
                        <td align="center" bgcolor="#FFFFFF" class="zwart"><?php print("$Aantal_toer"); ?></td>
                    	<?php
					}
                    if ($Reminder_send == 1)
					{
                    	?>
						<td width="17" align="center" bgcolor="#FF0000" class="wit"><?php print("$Inactief"); ?></td>
                        <?php
                    }
                    else
                    {
                    	?>
						<td width="17" align="center" bgcolor="#FFFFFF" class="zwart"><?php print("$Inactief"); ?></td>
                        <?php
                    }
                    ?>
				</tr>
				<?php
			}
			?>
            <tr>
            	<td colspan="8" height="30" bgcolor="#FFFFFF" class="zwart"><strong>Aantal accounts = <?php print("$Aantal_accounts"); ?></strong></td>
            </tr>
            <?php
		}
		else
		{
			?>
            <tr>
            	<td colspan="8" height="30" bgcolor="#FFFFFF" class="zwart"><strong>Geen accounts om te tonen</strong></td>
            </tr>
            <?php
		}
		?>
         </table>
        </div>
        </div>
        </td>
    </tr> 
    <tr>
        <td  height="50" align="center" bgcolor="#003300">
        <a href="Start_db.php" target="_self">
          <input type="button" style="width:190px; height:40px; background-color:#000; color:#FFF; font-size:16px;" value="Cancel"
            onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
        </a>
        </td>
        <td align="center" bgcolor="#003300">
        <input type="button" class="submit-button" style="width:150px; height:40px; background-color:#666; color:#FFF;"
        onclick="printDiv('printableArea')" title="Printen" value="Printen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
        </td>
    </tr>
</table>
</body>
</html>
