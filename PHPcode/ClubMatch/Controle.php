<?php
//© Hans Eekels, versie 03-01-2026
//Controle op corrupte database ClubMatch
require_once('../../../data/connectie_clubmatch.php');
//$Path = '../../../data/connectie_clubmatch.php';
//require_once('PHP/Functies_biljarten.php');

$Copy = Date("Y");
$Datum_nu = date('Y-m-d');

$Organisaties = array();
$Hulp_bediening = array();
$Hulp_competities = array();
$Hulp_partijen = array();
$Hulp_spelers_algemeen = array();
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
	$dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
	if (!$dbh)
	{
		throw new Exception(mysqli_connect_error());
	}
	mysqli_set_charset($dbh, "utf8");

	$sql = "SELECT DISTINCT org_nummer FROM bj_organisaties";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Organisaties[$teller]['org_nummer'] = $resultaat['org_nummer'];
    }
	$Aantal_organisaties = $teller;

	//bj_bediening
	$sql = "SELECT org_nummer FROM bj_bediening";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_bediening[$teller]['org_nummer'] = $resultaat['org_nummer'];
    }
	$Aantal_bediening = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_bediening + 1; $a++)
		{
			$Org_hulp = $Hulp_bediening[$a]['org_nummer'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['org_nummer'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in bj_bediening<br>";
			}
		}
	}
	
	//bj_competities
	$sql = "SELECT org_nummer FROM bj_competities";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_competities[$teller]['org_nummer'] = $resultaat['org_nummer'];
    }
	$Aantal_competities = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_competities + 1; $a++)
		{
			$Org_hulp = $Hulp_competities[$a]['org_nummer'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['org_nummer'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in bj_competities<br>";
			}
		}
	}
	
	//bj_partijen
	$sql = "SELECT org_nummer FROM bj_partijen";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_partijen[$teller]['org_nummer'] = $resultaat['org_nummer'];
    }
	$Aantal_partijen = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_partijen + 1; $a++)
		{
			$Org_hulp = $Hulp_partijen[$a]['org_nummer'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['org_nummer'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in bj_partijen<br>";
			}
		}
	}
	
	//bj_spelers_algemeen
	$sql = "SELECT spa_org FROM bj_spelers_algemeen";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_spelers_algemeen[$teller]['spa_org'] = $resultaat['spa_org'];
    }
	$Aantal_spelers_algemeen = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_spelers_algemeen + 1; $a++)
		{
			$Org_hulp = $Hulp_spelers_algemeen[$a]['spa_org'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['org_nummer'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in bj_spelers_algemeen<br>";
			}
		}
	}
	
	//bj_spelers_comp
	$sql = "SELECT spc_org FROM bj_spelers_comp";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_spelers_comp[$teller]['spc_org'] = $resultaat['spc_org'];
    }
	$Aantal_spelers_comp = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_spelers_comp + 1; $a++)
		{
			$Org_hulp = $Hulp_spelers_comp[$a]['spc_org'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['org_nummer'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in bj_spelers_comp<br>";
			}
		}
	}
	
	//bj_tafel
	$sql = "SELECT org_nummer FROM bj_tafel";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_tafel[$teller]['org_nummer'] = $resultaat['org_nummer'];
    }
	$Aantal_tafel = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_tafel + 1; $a++)
		{
			$Org_hulp = $Hulp_tafel[$a]['org_nummer'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['org_nummer'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in bj_tafel<br>";
			}
		}
	}
	
	//bj_uitslagen
	$sql = "SELECT org_nummer FROM bj_uitslagen";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_uitslagen[$teller]['org_nummer'] = $resultaat['org_nummer'];
    }
	$Aantal_uitslagen = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_uitslagen + 1; $a++)
		{
			$Org_hulp = $Hulp_uitslagen[$a]['org_nummer'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['org_nummer'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in bj_uitslagen<br>";
			}
		}
	}
	
	//bj_uitslag_hulp
	$sql = "SELECT org_nummer FROM bj_uitslag_hulp";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_uitslag_hulp[$teller]['org_nummer'] = $resultaat['org_nummer'];
    }
	$Aantal_uitslag_hulp = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_uitslag_hulp + 1; $a++)
		{
			$Org_hulp = $Hulp_uitslag_hulp[$a]['org_nummer'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['org_nummer'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in bj_uitslag_hulp<br>";
			}
		}
	}
	
	//bj_uitslag_hulp_tablet
	$sql = "SELECT org_nummer FROM bj_uitslag_hulp_tablet";
	$res = mysqli_query($dbh, $sql);
	if (!$res)
	{
		throw new Exception(mysqli_error($dbh));
	}
	
	$teller = 0;
	while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH))
	{
        $teller++;
		$Hulp_uitslag_hulp_tablet[$teller]['org_nummer'] = $resultaat['org_nummer'];
    }
	$Aantal_uitslag_hulp_tablet = $teller;
	
	if (mysqli_num_rows($res) > 0)
	{
		for ($a = 1; $a < $Aantal_uitslag_hulp_tablet + 1; $a++)
		{
			$Org_hulp = $Hulp_uitslag_hulp_tablet[$a]['org_nummer'];
			$bGevonden = FALSE;
			
			for ($b = 1; $b < $Aantal_organisaties + 1; $b++)
			{
				if ($Org_hulp == $Organisaties[$b]['org_nummer'])
				{
					$bGevonden = TRUE;
					break;
				}
			}
			
			if ($bGevonden == FALSE)
			{
				$Melding = $Melding . $Org_hulp . " in bj_uitslag_hulp_tablet<br>";
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
$msg = "ClubMatch fouten met: $Melding";
$headers = "From: info@specialsoftware.nl";
// send email
mail("hanseekels@gmail.com", "ClubMatch corrupt", $msg, $headers);

print("Klaar");
?>