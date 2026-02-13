<?php
//© Hans Eekels, versie 14-09-2025
//Toernooi account aanmaken
//email nu 40 tekens
$Copy = Date("Y");

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
      width: 900px;
    }

    .button:hover {
      border-color: #FFF;
    }
  </style>
  <script>
    function toggleOpenbaar() {
      const select = document.getElementById("openbaar");
      const div = document.getElementById("toon_openbaar");
      const inputs = div.querySelectorAll("input");

      if (select.value === "1") {
        div.style.display = "";
        inputs.forEach(inp => inp.setAttribute("required", "")); // verplicht maken
      } else {
        div.style.display = "none";
        inputs.forEach(inp => inp.removeAttribute("required")); // verplichting weg
      }
    }

    // bij laden meteen goed zetten
    document.addEventListener("DOMContentLoaded", toggleOpenbaar);
  </script>
</head>

<body>
  <table width="900" border="0">
    <tr>
      <td width="150" height="75" align="center" valign="middle" bgcolor="#006600"><img src="Figuren/Logo_standaard.jpg" width="150" height="75" alt="Logo" /></td>
      <td width="740" align="center" valign="middle" bgcolor="#006600" class="grootwit">
        <h2>ToernooiProf Online</h2><strong>Account aanmaken</strong>
      </td>
    </tr>
    <tr>
      <td height="50" colspan="2" align="center" bgcolor="#FFFFFF" class="grootzwart">
        U kunt hier gratis een account aanmaken, waarna u het programma ToernooiProf Online onbeperkt kunt gebruiken. Vul de gegevens hieroner in en klik op "Verzenden".<br>
        U krijgt dan per e-mail een <strong>verificatiecode</strong> toegezonden die u in de volgende pagina moet invoeren.<br>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="40" align="center" valign="middle" bgcolor="#009900">
        <h2>Vul de volgende gegevens in:</h2>
      </td>
    </tr>
    <tr>
      <td colspan="2" height="80" align="center" valign="middle" bgcolor="#009900">
        <form name="registreren" method="post" action="Toernooi_account.php">
          <table width="890" border="0">
            <tr>
              <td width="295" height="40" bgcolor="#009900" class="grootwit"><strong>Naam organisatie (of clubnaam)</strong></td>
              <td width="317" align="left" bgcolor="#009900" class="grootwit">
                <input type="text" name="naam_org" minlength="3" maxlength="30" size="30" tabindex="1" required autofocus>
              </td>
              <td width="265" align="left" bgcolor="#009900">Naam (3 - 30 tekens) is verplicht en wordt getoond in het programma</td>
            </tr>
            <tr>
              <td height="40" bgcolor="#009900" class="grootwit"><strong>Naam wedstrijdleider</strong></td>
              <td align="left" bgcolor="#009900" class="grootwit">
                <input type="text" name="naam_wl" minlength="3" maxlength="30" size="30" tabindex="2" requirerd>
              </td>
              <td align="left" bgcolor="#009900">Naam (3 -30 tekens) is verplicht, maar wordt alleen voor contact gebruikt</td>
            </tr>
            <tr>
              <td height="40" bgcolor="#009900" class="grootwit"><strong>Email wedstrijdleider</strong></td>
              <td align="left" bgcolor="#009900" class="grootwit">
                <input type="text" name="email_wl" maxlength="40" size="30" tabindex="3" required>
              </td>
              <td align="left" bgcolor="#009900">Email (max 40 tekens) is verplicht, maar wordt alleen voor contact gebruikt</td>
            </tr>
            <tr>
              <td height="40" bgcolor="#009900" class="grootwit"><strong>Aantal biljarttafels</strong></td>
              <td align="left" bgcolor="#009900" class="grootwit">
                <select name="tafels" style="font-size:18px;" tabindex="4">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4" selected>4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </td>
              <td align="left" bgcolor="#009900">
                Als u straks partijen gaat toekennen aan tafelnummers, dan wordt het hier opgegeven aantal tafels gebruikt (u kunt dit aantal later nog aanpassen)
              </td>
            </tr>
            <tr>
              <td height="40" align="left" valign="middle" bgcolor="#009900" class="grootwit"><strong>Nieuwsbrief ontvangen ?</strong></td>
              <td align="left" bgcolor="#009900">
                <select name="nieuwsbrief" style="font-size:18px;">
                  <option value="1" selected>Ja</option>
                  <option value="0">Nee</option>
                </select>
              </td>
              <td align="left" bgcolor="#009900">
                SpecialSoftware stuurt af en toe een Nieuwsbrief met belangrijk wijzigingen in de programma's. U kunt uw voorkeur altijd weer aanpassen.
              </td>
            </tr>

            <tr>
              <td height="160" valign="top" bgcolor="#00CC00">
                <br>
                <select id="openbaar" name="openbaar" tabindex="5" style="font-size:16px;" onChange="toggleOpenbaar()">
                  <option value="1" selected>Toernooi kan openbaar</option>
                  <option value="2">Toernooi nooit openbaar</option>
                </select>
                <br><br><br>
                <input type="button" class="submit-button" style="background-color:#F00; color:#FFF; width:100px; height:30px;" name="help4"
                  value="Help" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)"
                  onClick="window.open('Help/Help_kiesopenbaar.php','Help','width=620,height=500,scrollbars=no,toolbar=no,location=no'); return false" />
              </td>
              <td colspan="2" align="left" valign="middle" bgcolor="#00CC00">
                <div id="toon_openbaar">
                  <table width="575">
                    <tr>
                      <td width="278" bgcolor="#FF3300" class="grootwit">Naam Lokaliteit:</td>
                      <td width="285" bgcolor="#FF3300"><input type="text" name="loc_naam" minlength="3" maxlength="30" size="30"></td>
                    </tr>
                    <tr>
                      <td bgcolor="#FF3300" class="grootwit">Straat en nr Lokaliteit:</td>
                      <td bgcolor="#FF3300"><input type="text" name="loc_straat" minlength="3" maxlength="30" size="30"></td>
                    </tr>
                    <tr>
                      <td bgcolor="#FF3300" class="grootwit">Postcode Lokaliteit:</td>
                      <td bgcolor="#FF3300"><input type="text" name="loc_pc" minlength="6" maxlength="7" size="10"></td>
                    </tr>
                    <tr>
                      <td bgcolor="#FF3300" class="grootwit">Plaats Lokaliteit:</td>
                      <td bgcolor="#FF3300"><input type="text" name="loc_plaats" minlength="3" maxlength="30" size="30"></td>
                    </tr>
                    <tr>
                      <td bgcolor="#FF3300" class="grootwit">Toon email van wedstrijdleider voor informatie: </td>
                      <td bgcolor="#FF3300">
                        <select id="toon_email" name="toon_email" style="font-size:16px;">
                          <option value="1" selected>Ja</option>
                          <option value="0">Nee</option>
                        </select>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td height="50" align="center" valign="middle" bgcolor="#006600">
                <input type="button" style="width:140px; height:40px; background-color:#000; color:#FFF; font-size:24px; border-radius: 8px;"
                  onClick="location='../Start.php'" title="Cancel" value="Cancel" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)">
              </td>
              <td height="45" colspan="2" align="center" bgcolor="#006600">
                <input type="submit" style="width:190px; height:40px; background-color:#000; color:#FFF; font-size:24px; border-radius: 8px;" value="Verzenden" title="Account aanmaken"
                  tabindex="5" onMouseOver="mouseInBut(event)" onMouseOut="mouseOutBut(event)" />
              </td>
            </tr>
          </table>
        </form>
      </td>
    </tr>
  </table>
</body>

</html>