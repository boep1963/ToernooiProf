<?php
//© Hans Eekels, versie 03-01-2026
//Controle op corrupte database ToernooiProf
require_once('../../../data/connectie_toernooiprof.php');

$Organisaties = array();
$Hulp_bediening = array();
$Hulp_data = array();
$Hulp_poules = array();
$Hulp_spelers = array();
$Hulp_tafel = array();
$Hulp_uitslagen = array();
$Hulp_uitslag_hulp = array();
$Hulp_uitslag_hulp_tablet = array();

$Melding = "";

/*
Controles:
*	Dubbele organisaties of organisaties met return_code = 0
*	In alle tabellen records checken op niet bestaande organisatie; dan record verwijderen
*	Alle dia's, logo's en avatars checken op niet bestaande organisatie; dan verwijderen
*	Melding acties via email
*/

//haal organisaties op
try
{
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam);
	if (!$dbh)
	{
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT DISTINCT gebruiker_nr FROM tp_gebruikers";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Organisaties[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
    }
	$Aantal_organisaties = $teller;

	//tp_bediening
	$sql = "SELECT gebruiker_nr FROM tp_bediening";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_bediening[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
    }
	$Aantal_bediening = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_bediening + 1; $a++)
		{
			$Org_hulp = $Hulp_bediening[$a]['gebruiker_nr'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['gebruiker_nr'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in tp_bediening<br>";
			}
		}
	}
	
	//tp_data
	$sql = "SELECT gebruiker_nr FROM tp_data";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_data[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
    }
	$Aantal_data = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_data + 1; $a++)
		{
			$Org_hulp = $Hulp_data[$a]['gebruiker_nr'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['gebruiker_nr'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in tp_data<br>";
			}
		}
	}
	
	//tp_poules
	$sql = "SELECT gebruiker_nr FROM tp_poules";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_poules[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
    }
	$Aantal_poules = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_poules + 1; $a++)
		{
			$Org_hulp = $Hulp_poules[$a]['gebruiker_nr'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['gebruiker_nr'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in tp_poules<br>";
			}
		}
	}
	
	//tp_spelers
	$sql = "SELECT gebruiker_nr FROM tp_spelers";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_spelers[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
    }
	$Aantal_spelers = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_spelers + 1; $a++)
		{
			$Org_hulp = $Hulp_spelers[$a]['gebruiker_nr'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['gebruiker_nr'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in tp_spelers<br>";
			}
		}
	}
	
	//tp_tafel
	$sql = "SELECT gebruiker_nr FROM tp_tafel";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_tafel[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
    }
	$Aantal_tafel = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_tafel + 1; $a++)
		{
			$Org_hulp = $Hulp_tafel[$a]['gebruiker_nr'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['gebruiker_nr'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in tp_tafel<br>";
			}
		}
	}
	
	//tp_uitslagen
	$sql = "SELECT gebruiker_nr FROM tp_uitslagen";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_uitslagen[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
    }
	$Aantal_uitslagen = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_uitslagen + 1; $a++)
		{
			$Org_hulp = $Hulp_uitslagen[$a]['gebruiker_nr'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['gebruiker_nr'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in tp_uitslagen<br>";
			}
		}
	}
	
	//tp_uitslag_hulp
	$sql = "SELECT gebruiker_nr FROM tp_uitslag_hulp";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_uitslag_hulp[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
    }
	$Aantal_uitslag_hulp = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_uitslag_hulp + 1; $a++)
		{
			$Org_hulp = $Hulp_uitslag_hulp[$a]['gebruiker_nr'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['gebruiker_nr'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in tp_uitslag_hulp<br>";
			}
		}
	}
	
	//tp_uitslag_hulp_tablet
	$sql = "SELECT gebruiker_nr FROM tp_uitslag_hulp_tablet";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_uitslag_hulp_tablet[$teller]['gebruiker_nr'] = $resultaat['gebruiker_nr'];
    }
	$Aantal_uitslag_hulp_tablet = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_uitslag_hulp_tablet + 1; $a++)
		{
			$Org_hulp = $Hulp_uitslag_hulp_tablet[$a]['gebruiker_nr'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['gebruiker_nr'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in tp_uitslag_hulp_tablet<br>";
			}
		}
	}
	
	
	//close connection
	mysqli_close($dbh);
}
catch (Exception $e)
{
  echo $e->getMessage();
}

//meldingen per mail
$msg = "ToernooiProf fouten met: $Melding";
$headers = "From: info@specialsoftware.nl";
// send email
mail("hanseekels@gmail.com", "ToernooiProf corrupt", $msg, $headers);

print("Klaar");
?>