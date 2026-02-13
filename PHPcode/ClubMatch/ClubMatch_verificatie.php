<?php
//© Hans Eekels, versie 04-09-2025
//2 staps verificatie account aanmaken
//check op eerdere onbedoelde opslag
require_once('../../../data/connectie_clubmatch.php');
$Path = '../../../data/connectie_clubmatch.php';
require_once('PHP/Functies_biljarten.php');

$bGeslaagd = FALSE;    //wordt TRUE als alles is goedgegaan
$error_message = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $return_code = $_POST['return_code'];

    try {
        $dbh = mysqli_connect($dbhostname, $dbusername, $dbpassword, $dbnaam1);
        if (!$dbh) {
            throw new Exception(mysqli_connect_error());
        }
        mysqli_set_charset($dbh, "utf8");

        $sql = "SELECT * FROM bj_organisaties WHERE org_wl_email = '$email' AND return_code = '$return_code'";
        $res = mysqli_query($dbh, $sql);
        if (!$res) {
            throw new Exception(mysqli_error($dbh));
        }

        if (mysqli_num_rows($res) > 0) // Fix the condition to check if the code exists
        {
            while ($resultaat = mysqli_fetch_array($res, MYSQLI_BOTH)) {
                $time_start = $resultaat['time_start'];
                $Org_code = $resultaat['org_code'];
            }

            //huidige tijd
            $current_time = time();
            // Controleer of de code binnen de geldige tijdsduur valt (15 minuten)
            if (($current_time - $time_start) <= 900) {
                // Update het record om code_ontvangen op TRUE te zetten
                $sql = "UPDATE bj_organisaties SET code_ontvangen = '1' WHERE org_wl_email = '$email' AND return_code = '$return_code'";
                $res = mysqli_query($dbh, $sql);
                if (!$res) {
                    throw new Exception(mysqli_error($dbh));
                }

                $bGeslaagd = TRUE;
            } else {
                $error_message = "De verificatiecode is verlopen !<br>U wordt teruggeleid naar de Startpagina Programma's";
            }
        } else {
            $error_message = "Ongeldige verificatiecode !<br>U wordt teruggeleid naar de Startpagina Programma's";
        }

        //close connection
        mysqli_close($dbh);
    } catch (Exception $e) {
        echo $e->getMessage();
    }

    if ($bGeslaagd == TRUE) {

        //email zenden
        $msg = "Nieuw account ($Org_code) aangemaakt voor ClubMatch Online door $email";
        $headers = "From: info@specialsoftware.nl";
        // send email
        mail("hanseekels@gmail.com", "Nieuw account", $msg, $headers);

        //pagina met $Org_code en knop naar Inloggen
?>
        <!DOCTYPE html>
        <html>

        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>Account aangemaakt</title>
            <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
            <meta name="Description" content="ClubMatch" />
            <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
            <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
            <script src="PHP/script_competitie.js" defer></script>
            <style type="text/css">
                body {
                    width: 800px;
                    margin-top: 10px;
                }

                .button:hover {
                    border-color: #FFF;
                }
            </style>
        </head>

        <body>
            <form name="geslaagd" method="post" action="ClubMatch_inloggen.php">
                <table width="800" border="0">
                    <tr>
                        <td height="10" width="200">&nbsp;</td>
                        <td height="10" width="390">&nbsp;</td>
                        <td height="10" width="200">&nbsp;</td>
                    </tr>
                    <tr>
                        <td height="85" align="left" valign="middle" bgcolor="#009900"><img src="Beheer/uploads/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
                        <td colspan="2" align="center" valign="middle" bgcolor="#009900">
                            <h1>ClubMatch Online</h1>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" align="center" valign="middle" bgcolor="#009900">
                            <h1>Verificatie is voltooid</h1>
                        </td>
                    </tr>
                    <tr>
                        <td height="40" colspan="3" align="center" bgcolor="#009900" class="grootwit">
                            <strong>Met onderstaande code (goed bewaren !) kunt u nu inloggen op uw account</strong>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#009900">&nbsp;</td>
                        <td height="70" align="center" bgcolor="#FFFFFF" style="font-size:36px; font-weight:bold; color:#F00;">
                            <?php print("$Org_code"); ?>
                        </td>
                        <td bgcolor="#009900">&nbsp;</td>
                    </tr>
                    <tr>
                        <td colspan="3" height="45" align="center" valign="middle" bgcolor="#009900">
                            <input type="submit" class="submit-button" value="Naar inloggen" style="width:170px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
                                title="Naar inloggen" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                        </td>
                    </tr>
                </table>
            </form>
        </body>

        </html>
    <?php
        exit;
    } else {
        //foutmelding met knop naar Programma_start
    ?>
        <!DOCTYPE html>
        <html>

        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>ClubMatch</title>
            <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
            <meta name="Description" content="ClubMatch" />
            <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
            <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
            <script src="PHP/script_competitie.js" defer></script>
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
                    <td width="150" height="77" align="center" valign="middle" bgcolor="#003300"><img src="Beheer/uploads/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
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
                        <form name="cancel" method="post" action="../Start.php">
                            <input type="submit" class="submit-button" name="Beheer" value="Terug naar start" style="width:200px; height:40px; background-color:#0C0; color:#FFF; font-size:16px;"
                                title="Naar start" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                        </form>
                    </td>
                </tr>
                <tr>
                    <td height="40" colspan="2" align="right" bgcolor="#003300" class="klein">&copy;&nbsp;Hans Eekels <?php print("$Copy"); ?>&nbsp;</td>
                </tr>
            </table>
        </body>

        </html>
    <?php
        exit;
    }
} else {
    // Haal het emailadres op uit de URL-parameter
    $email = isset($_GET['email']) ? $_GET['email'] : '';        //deze code snap ik nog niet; werkt het zonder deze code ook?

    // Toon het formulier voor het invoeren van de return_code
    ?>
    <!DOCTYPE html>
    <html>

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Verificatiecode invoeren</title>
        <meta name="Keywords" content="Biljarten, Competitie, Hans Eekels" />
        <meta name="Description" content="ClubMatch" />
        <link rel="shortcut icon" href="../Figuren/eekels.ico" type="image/x-icon" />
        <link href="PHP/StijlCentreren.css" rel="stylesheet" type="text/css" />
        <script src="PHP/script_competitie.js" defer></script>
        <style type="text/css">
            body {
                width: 800px;
                margin-top: 10px;
            }

            .button:hover {
                border-color: #FFF;
            }
        </style>
    </head>

    <body>
        <form name="verificatie" method="post" action="ClubMatch_verificatie.php"> <!-- Add action to form -->
            <table width="800" border="0">
                <tr>
                    <td height="10" width="250">&nbsp;</td>
                    <td height="10" width="290">&nbsp;</td>
                    <td height="10" width="250">&nbsp;</td>
                </tr>
                <tr>
                    <td height="85" align="left" valign="middle" bgcolor="#009900"><img src="Beheer/uploads/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
                    <td colspan="2" align="center" valign="middle" bgcolor="#009900">
                        <h1>ClubMatch Online</h1>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" align="center" valign="middle" bgcolor="#009900">
                        <h1>Voer verificatiecode in</h1>
                    </td>
                </tr>
                <tr>
                    <td height="40" colspan="3" align="center" bgcolor="#009900" class="grootwit"><strong>Vul de code die u per mail hebt ontvangen hieronder in: </strong></td>
                </tr>
                <tr>
                    <td bgcolor="#009900" class="grootwit"><strong>Verificatiecode:</strong></td>
                    <td height="50" align="center" bgcolor="#FFFFFF">
                        <input type="text" name="return_code" size="10" style="font-size:36px;" required autofocus>
                    </td>
                    <td bgcolor="#009900">&nbsp;</td>
                </tr>
                <tr>
                    <td bgcolor="#009900" class="grootwit"><strong>Bijbehorend email-adres:</strong></td>
                    <td height="50" align="center" bgcolor="#FFFFFF" class="grootzwart">
                        <?php print("$email"); ?>
                        <input type="hidden" name="email" value="<?php print("$email"); ?>">
                    </td>
                    <td bgcolor="#009900">&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="3" height="45" align="center" valign="middle" bgcolor="#009900">
                        <input type="submit" class="submit-button" value="Verzenden" style="width:170px; height:40px; background-color:#000; color:#FFF; font-size:16px;"
                            title="Verzenden" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
                    </td>
                </tr>
            </table>
        </form>
    </body>

    </html>
<?php
    exit;
}
?>