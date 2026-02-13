<?php
//© Hans Eekels, versie 17-12-2025
//Startpagina voor Toernooiprogramma
//Tekst op Noodknop aangepast obv huidige ronde
//Data toernooi toegevoegd
require_once('../../../data/connectie_toernooiprof.php');
$Path = '../../../data/connectie_toernooiprof.php';
require_once('PHP/Functies_toernooi.php');

$Openbaar = array();
$Copy = Date("Y");
/*
var_dump($_POST) geeft:
array(2) { 
["t_nummer"]=> string(1) "1" 
["user_code"]=> string(10) "1000_KYZ@#" }
*/

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U wordt teruggeleid naar de Startpagina.";

if (isset($_POST['user_code'])) {
  $Code = $_POST['user_code'];
  if (strlen($Code) != 10) {
    $bAkkoord = FALSE;
  } else {
    $Gebruiker_naam = fun_testgebruiker($Code, $Path);
    if ($Gebruiker_naam == '9999') {
      $bAkkoord = FALSE;
    } else {
      $Gebruiker_nr = substr($Code, 0, 4);
      //logonaam
      $Logo_naam = "Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
      if (file_exists($Logo_naam) == FALSE) {
        $Logo_naam = "Beheer/uploads/Logo_standaard.jpg";
      }
    }
  }
} else {
  $bAkkoord = FALSE;
}

if (!isset($_POST['t_nummer'])) {
  $bAkkoord = FALSE;
} else {
  $Toernooi_nr = $_POST['t_nummer'];
  if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
    $bAkkoord = FALSE;
  }
}

if (count($_POST) != 2) {
  $bAkkoord = FALSE;
}

if ($bAkkoord == FALSE) {
?>
  <!DOCTYPE html>
  <html>

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Toernooi programma</title>
    <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
    <meta name="Description" content="Toernooiprogramma" />
    <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
    <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="PHP/script_toernooi.js" defer></script>
    <style type="text/css">
      body {
        width: 500px;
        margin-top: 100px;
      }

      .button:hover {
        border-color: #FFF;
      }
    </style>
  </head>

  <body>
    <table width="500" border="0">
      <tr>
        <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
        <td width="340" align="center" valign="middle" bgcolor="#003300">
          <h1>Foutmelding !</h1>
        </td>
      </tr>
      <tr>
        <td height="50" colspan="2" align="center">
          <div style="margin-left:5px; margin-right:5px; margin-bottom:5px; margin-top:5px; font-size:16px; font-weight:bold; background-color:#F00; color:#FFF;">
            <?php print($error_message); ?>
          </div>
        </td>
      </tr>
      <tr>
        <td height="60" colspan="2" align="center" valign="middle" bgcolor="#003300">
          <form name="partijen" method="post" action="../Start.php">
            <input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
              title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          </form>
        </td>
      </tr>
      <tr>
        <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">info: hanseekels@gmail.com&nbsp;&copy;&nbsp;<?php print("$Copy"); ?>&nbsp;</td>
      </tr>
    </table>
  </body>

  </html>
<?php
  exit;
}

//verder
$Openbaar = fun_openbaar($Code, $Path);
$Toernooi_openbaar = $Openbaar[1];      //1 = ja, 2 = nee
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);

//bepaal huidige ronde
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
$Aantal_poules = fun_aantalpoules($Gebruiker_nr, $Toernooi_nr, $Huidige_ronde, $Path);
$Aantal_spelers = fun_aantalspelersinronde($Gebruiker_nr, $Toernooi_nr, $Huidige_ronde, $Path);

?>
<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Toernooi beheer</title>
  <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
  <meta name="Description" content="Toernooiprogramma" />
  <link rel="shortcut icon" href="Figuren/eekels.ico" type="image/x-icon" />
  <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
  <script src="PHP/script_toernooi.js" defer></script>
  <style type="text/css">
    body {
      width: 1010px;
      margin-top: 0px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
</head>

<body>
  <table width="1010" border="0">
    <tr>
      <td height="10" width="186" bgcolor="#000000">&nbsp;</td>
      <td width="58" bgcolor="#000000">&nbsp;</td>
      <td width="186" bgcolor="#000000">&nbsp;</td>
      <td width="58" bgcolor="#000000">&nbsp;</td>
      <td width="186" bgcolor="#000000">&nbsp;</td>
      <td width="58" bgcolor="#000000">&nbsp;</td>
      <td width="186" bgcolor="#000000">&nbsp;</td>
      <td width="58" bgcolor="#000000">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="2" height="105" align="left" valign="middle" bgcolor="#006600"><img src="<?php print("$Logo_naam"); ?>" width="210" height="105" alt="Logo" /></td>
      <td colspan="6" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <h1>Toernooi-beheer</h1>
        <strong><?php print("$Gebruiker_naam"); ?></strong>
      </td>
    </tr>
    <tr>
      <td height="30" colspan="2" align="center" bgcolor="#006600" class="grootwit"><strong>Huidige ronde&nbsp;<?php print("$Huidige_ronde"); ?></strong></td>
      <td height="30" colspan="6" align="center" bgcolor="#006600" class="grootwit"><strong><?php print("$Toernooi_naam"); ?></strong></td>
    </tr>
    <tr>
      <td height="30" colspan="2" align="center" bgcolor="#00CC00" class="grootwit"><strong>Informatie huidige ronde</strong></td>
      <td height="30" colspan="6" align="center" bgcolor="#00CC00" class="grootwit"><strong>Toernooi beheer</strong></td>
    </tr>
    <tr>
      <td height="60" colspan="2" align="center" valign="middle" bgcolor="#00CC00">
        <div style="margin:5px; background-color:#FFF; color:#F00; font-size:16px;">
          Aantal spelers:&nbsp;<?php print("$Aantal_spelers"); ?><br>
          Aantal poules:&nbsp;<?php print("$Aantal_poules"); ?> <br>
        </div>
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <form name="planning" method="post" action="Partijbeheer/Kies_poule.php">
          <input type="submit" class="submit-button" value="Uitslagen/Partijen" style="width:165px; height:55px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Naar partij-indelingen en uitslagbeheer" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_partijbeheer.php','Help','width=370,height=300,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
      <td height="60" align="center" valign="middle" bgcolor="#00CC00">
        <form name="ronde" method="post" action="Rondebeheer/Ronde_nieuw01.php">
          <input type="submit" class="submit-button" value="Maak nieuwe ronde" style="width:165px; height:55px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Maak nieuwe toernooironde aan" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td height="60" align="center" valign="middle" bgcolor="#00CC00">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_ronden.php','Help','width=370,height=490,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <?php
        if ($Toernooi_openbaar == 1) {
        ?>
          <form name="borden" method="post" action="Openbaar_wijzig.php">
            <input type="submit" class="submit-button" value="Stand openbaar?" style="width:165px; height:55px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
              title="Stand openbaar of niet" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          </form>
        <?php
        } else {
          print("Toernooi al dan niet openbaar<br>kunt u hier niet wijzigen");
        }
        ?>
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_openbaar.php','Help','width=520,height=250,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
    <tr>
      <td height="30" colspan="2" align="center" valign="middle" bgcolor="#00CC00" class="grootwit"><strong>Help algemeen</strong></td>
      <td height="30" colspan="6" align="center" valign="middle" bgcolor="#00CC00" class="grootwit"><strong>Overzichten</strong></td>
    </tr>
    <tr>
      <td height="60" colspan="2" align="center" valign="middle" bgcolor="#00CC00" class="zwart">
        <input type="button" class="submit-button" value="Help" style="width:165px; height:55px; background-color:#F00; color:#FFF; font-size:16px; border-radius: 8px;"
          onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
          onClick="window.open('Help/Help_algemeen.php','Help','width=780,height=710,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00" class="zwart">
        <form name="stand" method="post" action="Stand/Kies_poule.php">
          <input type="submit" class="submit-button" value="Stand" style="width:165px; height:55px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Stand per poule" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_stand.php','Help','width=370,height=290,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00" class="zwart">
        <form name="ovpoules" method="post" action="Poules/Kies_poule.php">
          <input type="submit" class="submit-button" value="Poule-indeling" style="width:165px; height:55px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Samenstelling poules" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_poules.php','Help','width=370,height=230,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00" class="zwart">
        <form name="ovspeler" method="post" action="Ovspelers/Kies_speler.php">
          <input type="submit" class="submit-button" value="Overzicht speler" style="width:165px; height:55px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Overzicht per speler" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_ovspelers.php','Help','width=370,height=150,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
    </tr>
    <tr>
      <td height="30" colspan="2" align="center" bgcolor="#FF0000" class="grootwit"><strong>Noodknop</strong></td>
      <td height="30" colspan="2" align="center" bgcolor="#00CC00" class="grootwit"><strong>Naam speler wijzigen</strong></td>
      <td height="30" colspan="2" align="center" bgcolor="#00CC00" class="grootwit"><strong>Zoek speler</strong></td>
      <td height="30" colspan="2" align="center" bgcolor="#00CC00" class="grootwit"><strong>Historie</strong></td>
    </tr>
    <tr>
      <td height="60" align="center" valign="middle" bgcolor="#000000">
      <?php
      if ($Huidige_ronde == 1)
	  {
		  $Nm_knop = "Start ongedaan maken";
	  }
	  else
	  {
      	  $Nm_knop = "Ronde $Huidige_ronde ongedaan maken";
	  }
	  ?>
        <form name="opnieuw" method="post" action="Nood/Start_ongedaanmaken.php">
          <input type="submit" class="submit-button" value="<?php print("$Nm_knop"); ?>" style="width:165px; height:55px; background-color:#F00; color:#FFF; font-size:14px; border-radius: 8px;"
            title="Lees help !!" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#000000">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_opnieuw.php','Help','width=450,height=360,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00" class="zwart">
        <form name="spelerwijzig" method="post" action="Nood/Naam_wijzigen.php">
          <input type="submit" class="submit-button" value="Spelernaam wijzigen" style="width:165px; height:55px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Naam speler wijzigen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_naam.php','Help','width=370,height=200,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00" class="zwart">
        <form name="zoeken" method="post" action="Nood/Zoek_speler.php">
          <input type="submit" class="submit-button" value="Zoek speler" style="width:165px; height:55px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
            title="Zoek speler in poule" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_zoeken.php','Help','width=370,height=290,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00" class="grootwit">
        <?php
        if ($Huidige_ronde == 1) {
          print("Pas beschikbaar<br>vanaf ronde 2");
        } else {
        ?>
          <form name="history" method="post" action="History/Keuze_start.php">
            <input type="submit" class="submit-button" value="Historie" style="width:165px; height:55px; background-color:#000; color:#FFF; font-size:16px; border-radius: 8px;"
              title="Overzichten in vorige ronden" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
            <input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
          </form>
        <?php
        }
        ?>
      </td>
      <td align="center" valign="middle" bgcolor="#00CC00">
        <input type="image" src="Figuren/Help_fig.jpg" onMouseOver="mouseIn(event)" onMouseOut="mouseOut(event)"
          onClick="window.open('Help/Help_history.php','Help','width=370,height=140,scrollbars=no,toolbar=no,location=no'); return false" />
      </td>
    </tr>
    <tr>
      <td height="25" colspan="8" align="center" valign="middle" bgcolor="#009900">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="2" height="45" align="center" bgcolor="#006600">
        <form name="cancel" method="post" action="Toernooi_start.php">
          <input type="submit" class="submit-button" value="Afsluiten" style="width:165px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
            title="Terug naar Start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
          <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
        </form>
      </td>
      <td colspan="2" align="center" bgcolor="#006600">
      <form name="data" method="post" action="Data_comp.php">
		<input type="submit" class="submit-button" value="Toernooi-gegevens" style="width:150px; height:30px; background-color:#000; color:#FFF; font-size:12px;"
		title="Gegevens" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
		<input type="hidden" name="t_nummer" value="<?php print("$Toernooi_nr"); ?>">
            <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
	  </form>
      </td>
      <td colspan="4" align="right" bgcolor="#006600" class="klein">&copy; Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
    </tr>
  </table>
</body>

</html>