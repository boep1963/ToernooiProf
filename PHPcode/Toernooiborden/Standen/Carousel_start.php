<?php
/*
Hans Eekels 23-06-2025
Start Carousel met standen; check op 0 poules
NB: code van ChatGPT
*/
require_once('../../../../data/connectie_toernooiprof.php');
$Path = '../../../../data/connectie_toernooiprof.php';
require_once('../../ToernooiProf/PHP/Functies_toernooi.php');

//var_dump($_POST) geeft na start: array(4) { ["start_poule"]=> string(1) "1" ["eind_poule"]=> string(1) "2" ["klok"]=> string(1) "5" ["start"]=> string(0) "" }

$Stand = array();

$bAkkoord = TRUE;
$error_message = "Verwachte gegevens kloppen niet !<br>U keert terug naar de startpagina.";

//array(2) { ["t_nummer"]=> string(1) "1" ["stop"]=> string(0) "" }
//array(5) { ["t_nummer"]=> string(1) "1" ["start_poule"]=> string(1) "1" ["eind_poule"]=> string(1) "2" ["klok"]=> string(2) "10" ["start"]=> string(0) "" }

//check
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
            $Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_" . $Gebruiker_nr . ".jpg";
            if (file_exists($Logo_naam) == FALSE) {
                $Logo_naam = "../../ToernooiProf/Beheer/uploads/Logo_standaard.jpg";
            }
        }
    }
} else {
    $bAkkoord = FALSE;
}

if (!isset($_POST['toernooi_nr'])) {
    $bAkkoord = FALSE;
} else {
    $Toernooi_nr = intval($_POST['toernooi_nr']);
    if (filter_var($Toernooi_nr, FILTER_VALIDATE_INT) == FALSE) {
        $bAkkoord = FALSE;
    }
}

//check op cancel
//var_dump($_POST) kan "cancel geven, dan terug naar keuze
if (isset($_POST['cancel'])) {
?>
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="UTF-8">
        <title>Redirect</title>
        <script type="text/javascript">
            window.onload = function() {
                document.forms[0].submit();
            }
        </script>
    </head>

    <body style="background-color:#333; margin:0;">
        <form method="post" action="../Kies_optie.php">
            <input type="hidden" name="user_code" value="<?php echo $Code; ?>">
            <input type="hidden" name="toernooi_nr" value="<?php echo $Toernooi_nr; ?>">
        </form>
    </body>

    </html>
<?php
    exit;
}

//check
if ($bAkkoord == FALSE) {
?>
    <!DOCTYPE html>
    <html>

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Toernooi programma</title>
        <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
        <meta name="Description" content="Toernooiprogramma" />
        <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
        <link href="../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
        <script src="../../ToernooiProf/PHP/script_toernooi.js" defer></script>
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
                <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
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
                    <form name="cancel" method="post" action="../../Start.php">
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

//initieren
$bStart = FALSE;        //geen carousel, bediening zichtbaar
$bCarousel = TRUE;        //geen carousel bij startpoule == eindpoule

//["start"]=> string(0) "" }
//["stop"]=> string(0) "" }

// Controleer of de start_poule, eind_poule, en klok zijn ingesteld via POST
if (isset($_POST['start_poule'])) {
    $Poule_start = $_POST['start_poule'];
} else {
    $Poule_start = 1;
}

if (isset($_POST['eind_poule'])) {
    $Poule_eind = $_POST['eind_poule'];
} else {
    $Poule_eind = $Aantal_poules;
}

//geen rare volgorde
if (isset($_POST['start_poule']) && isset($_POST['eind_poule'])) {
    if ($Poule_start > $Poule_eind) {
        $Poule_start = $Poule_eind;
    }
    if ($Poule_start == $Poule_eind) {
        $bCarousel = FALSE;
    }
}

if (isset($_POST['klok'])) {
    $Klok = $_POST['klok'];
} else {
    $Klok = 5;
}

// Start de carousel als 'start' is ingesteld
if (isset($_POST['start'])) {
    $bStart = TRUE; // Carousel aan
    // Als $Poule_nr niet in de POST zit, begin met $Poule_start
    if (isset($_POST['Poule_nr'])) {
        $Poule_nr = $_POST['Poule_nr'];
    } else {
        $Poule_nr = $Poule_start;
    }
} elseif (isset($_POST['stop'])) {
    $bStart = FALSE; // Carousel uit
} else {
    $bStart = FALSE; // Geen actie, zet carousel uit
}

/*
Controleer of $Toernooi_nr beschikbaar is
if (isset($_POST['toernooi_nr'])) {
    $Toernooi_nr = $_POST['toernooi_nr'];
} else {
    // Voeg een fallback toe, mocht dit niet in de POST zitten
    $Toernooi_nr = 0; // Dit moet de waarde zijn die je wilt gebruiken als fallback
}
*/
$Huidige_ronde = fun_huidigeronde($Gebruiker_nr, $Toernooi_nr, $Path);
$Toernooi_naam = fun_toernooinaam($Gebruiker_nr, $Toernooi_nr, $Path);
$Aantal_poules = fun_aantalpoules($Gebruiker_nr, $Toernooi_nr, $Huidige_ronde, $Path);

//check
if ($Aantal_poules == 0) {
    $error_message = "Er zijn geen poules om te tonen !<br>U keert terug naar de keuzepagina.";
?>
    <!DOCTYPE html>
    <html>

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Toernooi programma</title>
        <meta name="Keywords" content="Biljarten, Toernooi, Hans Eekels" />
        <meta name="Description" content="Toernooiprogramma" />
        <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
        <link href="../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
        <script src="../../ToernooiProf/PHP/script_toernooi.js" defer></script>
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
                <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="<?php print("$Logo_naam"); ?>" width="150" height="75" alt="Logo" /></td>
                <td width="340" align="center" valign="middle" bgcolor="#003300">
                    <h1>Melding !</h1>
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
                    <form name="cancel" method="post" action="../Start.php">
                        <input type="submit" class="submit-button" value="Terug" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
                            title="Terug naar keuze" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                        <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
                        <input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
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

// Verwerk de carousel
if ($bStart == TRUE) {
    // Toon de stand van de huidige poule
    $Stand = fun_stand($Gebruiker_nr, $Toernooi_nr, $Huidige_ronde, $Poule_nr, $Path);
    //echo $Stand;

    $PouleNrGebruiken = $Poule_nr;

    // Update de $Poule_nr voor de volgende cyclus
    if ($Poule_nr < $Poule_eind) {
        $Poule_nr++; // Ga naar de volgende poule
    } else {
        $Poule_nr = $Poule_start; // Terug naar de start poule als het einde is bereikt
    }

    if ($bCarousel == TRUE) {
        // Voeg de JavaScript toe om de pagina opnieuw te laden met een delay
        echo '<script type="text/javascript">
				setTimeout(function() {
					document.forms["verwerken"].submit();
				}, ' . ($Klok * 1000) . ');
			  </script>';
    }
    // Voeg hidden fields toe om de $Poule_nr en andere variabelen door te geven bij elke POST
    echo '<form id="verwerken" method="POST" action="">';
    echo '<input type="hidden" name="Poule_nr" value="' . $Poule_nr . '">';
    echo '<input type="hidden" name="start_poule" value="' . $Poule_start . '">';
    echo '<input type="hidden" name="eind_poule" value="' . $Poule_eind . '">';
    echo '<input type="hidden" name="klok" value="' . $Klok . '">';
    echo '<input type="hidden" name="user_code" value="' . $Code . '">';
    echo '<input type="hidden" name="toernooi_nr" value="' . $Toernooi_nr . '">';
    echo '<input type="hidden" name="start" value="1">'; // Zorg ervoor dat 'start' ook weer meegegeven wordt
    echo '</form>';
} else {
    // Voeg hidden fields toe om de carousel opnieuw te starten
    echo '<form id="verwerken" method="POST" action="">';
    echo '<input type="hidden" name="start_poule" value="' . $Poule_start . '">';
    echo '<input type="hidden" name="eind_poule" value="' . $Poule_eind . '">';
    echo '<input type="hidden" name="klok" value="' . $Klok . '">';
    echo '<input type="hidden" name="user_code" value="' . $Code . '">';
    echo '<input type="hidden" name="toernooi_nr" value="' . $Toernooi_nr . '">';
    echo '</form>';
}

?>
<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Scorebord</title>
    <link rel="shortcut icon" href="../../Figuren/eekels.ico" type="image/x-icon" />
    <link href="../../ToernooiProf/PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
    <script src="../../ToernooiProf/PHP/script_toernooi.js" defer></script>
    <style type="text/css">
        body,
        td,
        th {
            font-family: Arial;
            font-size: 12px;
            color: #000;
        }

        body {
            width: 1860px;
            background-color: #000;
            margin-top: 20px;
            margin-right: auto;
            margin-bottom: 0px;
            margin-left: auto;
        }

        .Groot {
            font-size: 36px;
        }

        .Grootwit {
            font-size: 36px;
            color: #FFF;
        }

        h1 {
            font-size: 76px;
        }

        h2 {
            font-size: 36px;
        }

        h3 {
            font-size: 24px;
        }

        h4 {
            font-size: 14px;
        }

        h5 {
            font-size: 12px;
        }

        h6 {
            font-size: 10px;
        }

        .submit-button {
            border: 1px solid transparent;
            cursor: pointer;
        }

        .submit-button:hover {
            border-color: #FFF;
        }

        div.scroll {
            background-color: #FFF;
            width: 1850px;
            height: 650px;
            overflow: auto;
        }
    </style>
</head>

<body>
    <form name="verwerken" method="post" action="Carousel_start.php">
        <table width="1860" border="0" bgcolor="#FFFFFF">
            <tr>
                <td height="40" colspan="2" align="center" style="font-size:36px"><strong><?php print("$Toernooi_naam"); ?></strong>
                    <input type="hidden" name="user_code" value="<?php print("$Code"); ?>">
                    <input type="hidden" name="toernooi_nr" value="<?php print("$Toernooi_nr"); ?>">
                </td>
            </tr>
            <tr>
                <?php
                if ($bStart == TRUE) {
                ?>
                    <td align="center" valign="top" height="650">
                        <div class="scroll">
                            <table width="1820" border="1">
                                <tr>
                                    <td colspan="9" align="center" class="Groot"><strong>Stand Poule <?php print("$PouleNrGebruiken"); ?> in ronde <?php print("$Huidige_ronde"); ?></strong></td>
                                </tr>
                                <tr>
                                    <td width="77" height="30" align="center"><strong><span class="Groot">Pos</span></strong></td>
                                    <td width="603"><strong><span class="Groot">Naam</span></strong></td>
                                    <td width="152" align="center"><strong><span class="Groot">Punten</span></strong></td>
                                    <td width="158" align="center"><strong><span class="Groot">Partijen</span></strong></td>
                                    <td width="138" align="center"><strong><span class="Groot">Car</span></strong></td>
                                    <td width="122" align="center"><strong><span class="Groot">Brt</span></strong></td>
                                    <td width="181" align="right"><strong><span class="Groot">Moyenne</span></strong></td>
                                    <td width="151" align="center"><strong><span class="Groot">HS</span></strong></td>
                                    <td width="180" align="right"><strong><span class="Groot">% Car</span></strong></td>
                                </tr>

                                <?php
                                $Aantal_spelers = fun_aantalspelersinpoule($Gebruiker_nr, $Toernooi_nr, $Huidige_ronde, $PouleNrGebruiken, $Path);
                                for ($b = 0; $b < $Aantal_spelers; $b++) {
                                    $Pos = $b + 1;
                                    $Naam = $Stand[$b]['naam'];
                                    $Punten = $Stand[$b]['punten'];
                                    $Partijen = $Stand[$b]['partijen'];
                                    $Car = $Stand[$b]['car_gem'];
                                    $Brt = $Stand[$b]['brt'];
                                    $Moy = $Stand[$b]['moy'];
                                    $HS = $Stand[$b]['hs'];
                                    $Car_per = $Stand[$b]['per_car'];
                                ?>
                                    <tr>
                                        <td height="30" align="center" class="Groot"><?php print("$Pos"); ?></td>
                                        <td class="Groot"><?php print("$Naam"); ?></td>
                                        <td align="center" class="Groot"><?php print("$Punten"); ?></td>
                                        <td align="center" class="Groot"><?php print("$Partijen"); ?></td>
                                        <td align="center" class="Groot"><?php print("$Car"); ?></td>
                                        <td align="center" class="Groot"><?php print("$Brt"); ?></td>
                                        <td align="right" class="Groot"><?php print("$Moy"); ?></td>
                                        <td align="center" class="Groot"><?php print("$HS"); ?></td>
                                        <td align="right" class="Groot"><?php print("$Car_per"); ?></td>
                                    </tr>
                                <?php
                                }    //end for per speler
                                ?>
                            </table>
                        </div>
                    </td>
                <?php
                }    //end if $bStart == TRUE
                else {
                ?>
                    <td align="center" valign="middle" height="650" bgcolor="#CCCCCC" class="Groot">
                        Druk op Start om alle gekozen poule-standen te tonen
                    </td>
                <?php
                }
                ?>
                </td>
            </tr>
            <tr>
                <td align="center">
                    <table width="1850" border="1">
                        <tr>
                            <td height="60" width="300" align="center">
                                <input type="button" class="submit-button" value="Help" style="width:285px; height:50px; background-color:#333; color:#FFF; font-size:36px; font-weight:bold;"
                                    onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
                                    onClick="window.open('Help_algemeen.php','Help','width=420,height=240,scrollbars=no,toolbar=no,location=no'); return false" />
                            </td>
                            <td width="320" align="center" bgcolor="#FFFFFF" class="Groot">Kies Startpoule</td>
                            <td width="320" align="center" class="Groot">Kies Eindpoule</td>
                            <td width="361" align="center" class="Groot">Interval in seconden</td>
                            <td width="256" align="center" class="Groot">Start</td>
                            <td width="257" align="center" class="Groot">Stop</td>
                        </tr>
                        <tr>
                            <td align="center" class="Groot">
                                <input type="submit" name="cancel" value="Cancel" style="width:280px; height:50px; background-color:#000; color:#FFF; font-size:36px; font-weight:bold;"
                                    onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
                            </td>
                            <?php
                            if ($bStart == FALSE) {
                            ?>
                                <td align="center" class="Groot">
                                    <select name="start_poule" style="font-size:36px">
                                        <?php
                                        for ($c = 1; $c < $Aantal_poules + 1; $c++) {
                                            if ($c == 1) {
                                        ?>
                                                <option value="<?php print("$c"); ?>" selected><?php print("Poule $c"); ?></option>
                                            <?php
                                            } else {
                                            ?>
                                                <option value="<?php print("$c"); ?>"><?php print("Poule $c"); ?></option>
                                        <?php
                                            }
                                        }
                                        ?>
                                    </select>
                                </td>
                                <td align="center" class="Groot">
                                    <select name="eind_poule" style="font-size:36px">
                                        <?php
                                        for ($c = 1; $c < $Aantal_poules + 1; $c++) {
                                            if ($c == $Aantal_poules) {
                                        ?>
                                                <option value="<?php print("$c"); ?>" selected><?php print("Poule $c"); ?></option>
                                            <?php
                                            } else {
                                            ?>
                                                <option value="<?php print("$c"); ?>"><?php print("Poule $c"); ?></option>
                                        <?php
                                            }
                                        }
                                        ?>
                                    </select>
                                </td>
                                <td align="center" class="Groot">
                                    <select name="klok" style="font-size:48px">
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="15">15</option>
                                        <option value="20">20</option>
                                    </select>
                                </td>
                                <td align="center" bgcolor="#FFFFFF">
                                    <button type="submit" name="start" style="border:none;"><img src="Start.jpg"></button>
                                </td>
                                <td align="center" bgcolor="#CCCCCC">&nbsp;</td>
                            <?php
                            }
                            if ($bStart == TRUE) {
                            ?>
                                <td align="center" bgcolor="#CCCCCC" class="Groot"><?php print("$Poule_start"); ?></td>
                                <td align="center" bgcolor="#CCCCCC" class="Groot"><?php print("$Poule_eind"); ?></td>
                                <td align="center" bgcolor="#CCCCCC" class="Groot"><?php print("$Klok"); ?></td>
                                <td align="center" bgcolor="#CCCCCC">&nbsp;</td>
                                <td align="center" bgcolor="#FFFFFF">
                                    <button type="submit" name="stop" style="border:none;"><img src="Stop.jpg"></button>
                                </td>
                            <?php
                            }
                            ?>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </form>
</body>

</html>