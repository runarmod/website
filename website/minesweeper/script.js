// Laget av Runar Saur Modahl, avsluttet 27.02.2020

// Definerer alle variabler som er sjekke å ha globale
var kart,
    x,
    y,
    inputBredde,
    inputHoyde,
    bombe,
    storrelsePerRute,
    breddeGameSection,
    forsteKlikk,
    inputBomber,
    flaggPlassert,
    feilFlaggPlassering,
    gamesection,
    antallBomberIgjen,
    startTid,
    totalTid,
    tapt,
    resultat,
    intervall,
    fontSizeEmoji;

resultat = document.getElementById("resultat");
gamesection = document.getElementById("gamesection");

breddeGameSection = 700;
document.getElementById("wrapper").style.maxWidth = breddeGameSection + "px";

flagg = "🚩";
bombe = "💣";
feilFlaggPlassering = "❌";

forsteKlikk = true; // Man er på første klikk når siden oppdateres

// Når radiobutton custom er markert vises inputfields
function visCustom() {
    document.getElementById("customSettings").style.visibility = "visible";
}

// Når radiobutton custom ikke er markert vises inputfields
function skjulCustom() {
    document.getElementById("customSettings").style.visibility = "hidden";
}

function startSpill() {
    forsteKlikk = true; // Når det startes nytt spill starter man med sitt første klik
    tapt = false; // Man har ikke tapt når man ikke har starta

    // Noen ting som må resettes hver gang man starter på nytt
    clearInterval(intervall);
    document.getElementById("tid").innerHTML = "Tid: ";
    resultat.innerHTML = "";

    var gameMode = document.querySelector('input[name="gamemode"]:checked').value; // Henter gamemode
    if (gameMode == "custom") {
        inputBredde = Number(document.getElementById("bredde").value);

        if (inputBredde > 50) {
            inputBredde = 50; // Maks 50 bred
        } else if (inputBredde < 4) {
            inputBredde = 4; // Minst 4 bred
        }

        inputHoyde = Number(document.getElementById("hoyde").value);
        if (inputHoyde > 30) {
            inputHoyde = 30; // Maks 30 i høyden
        } else if (inputHoyde < 4) {
            inputHoyde = 4; // Minst 4 i høydem
        }

        inputBomber = Number(document.getElementById("bomber").value);
        if (inputBomber > 300) {
            inputBomber = 300; // Maks 300 bomber
        } else if (inputBomber < 1) {
            inputBomber = 1; // Minst 1 bomber
        }


        // Forhåndslagde gamemodes:
    } else if (gameMode == "beginner") {
        inputBredde = 9;
        inputHoyde = 9;
        inputBomber = 10;
    } else if (gameMode == "intermediate") {
        inputBredde = 16;
        inputHoyde = 16;
        inputBomber = 40;
    } else if (gameMode == "expert") {
        inputBredde = 30;
        inputHoyde = 16;
        inputBomber = 99;
    }

    // Ikke flere bomber enn ruter
    if (inputBomber >= inputBredde * inputHoyde) {
        return alert("Det er flere bomber enn ruter");
    }

    createMap(inputBredde, inputHoyde, inputBomber); // Lag kartet
    bomberIgjen(); // Oppdater antall bomber igjen
    gamesection.style.pointerEvents = "auto"; // Gjør det mulig å trykke i spilleområdet
}


function createMap(width, height, bombs) {
    gamesection.innerHTML = ""; // Reset spilleområdet

    // Lag en tom array med en viss størrelse
    kart = new Array(height);
    for (var i = 0; i < height; i++) {
        kart[i] = new Array(width);
        for (var j = 0; j < width; j++) {
            kart[i][j] = 0;
        }
    }

    // Plasser bomber i kart-arrayen
    for (var i = 0; i < bombs; i++) {
        randomPos();
        // Kan ikke plassere en bombe der det er en bombe
        while (kart[y][x] == bombe) {
            randomPos();
        }
        kart[y][x] = bombe;
    }
    // Loop gjennom hele kartet og lag riktige tall rundt bombene, men ikke på ruter det er bomber
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if (kart[i][j] == bombe) {
                // På øverste rad er det ingen rader over, så kan ikke legge til tall der, derfor i>0
                if (i > 0) {
                    if (kart[i - 1][j] != bombe) kart[i - 1][j]++; // Over
                    if (j < width - 1 && kart[i - 1][j + 1] != bombe) kart[i - 1][j + 1]++; // Over til høyre (sjekker først at ruta ikke er på siste kolonne)
                    if (j > 0 && kart[i - 1][j - 1] != bombe) kart[i - 1][j - 1]++; // Over til venstre (sjekker først at ruta ikke er på første kolonne)
                };

                if (j < width - 1 && kart[i][j + 1] != bombe) kart[i][j + 1]++; // Til høyre (sjekker først at ruta ikke er på siste kolonne)
                if (j > 0 && kart[i][j - 1] != bombe) kart[i][j - 1]++; // Til venstre (sjekker først at ruta ikke er på første kolonne)

                // På nederste rad er det ingen rader under, så kan ikke legge til tall der, derfor i<height-1
                if (i < height - 1) {
                    if (kart[i + 1][j] != bombe) kart[i + 1][j]++; // Under
                    if (j < width - 1 && kart[i + 1][j + 1] != bombe) kart[i + 1][j + 1]++; // Under til høyre (sjekker først at ruta ikke er på siste kolonne)
                    if (j > 0 && kart[i + 1][j - 1] != bombe) kart[i + 1][j - 1]++; // Under til venstre (sjekker først at ruta ikke er på første kolonne)
                };
            }
        }
    }

    storrelsePerRute = Math.floor(breddeGameSection / inputBredde) - 3; // Juster størrelsen per rute for å tilpasse skjermen
    gamesection.style.width = storrelsePerRute * width; // Juster bredden til spillområdet
    fontSizeEmoji = storrelsePerRute * 3 / 4; // Skriftsstørrelsen til emojien skal være litt mindre

    for (var i = 0; i < height; i++) {
        var radDiv = document.createElement("div");
        radDiv.id = "y" + i;
        gamesection.appendChild(radDiv); // Lag divs som hver rute kan settes inni (en div = en rad)
        for (var j = 0; j < width; j++) {
            var rute = document.createElement('span');
            rute.style.height = storrelsePerRute + "px";
            rute.style.width = storrelsePerRute + "px";
            // Skriftsstørrelsene:
            if (!rute.className.includes("opnet")) {
                rute.style.fontSize = storrelsePerRute + "px";
            } else {
                rute.style.fontSize = fontSizeEmoji + "px";
            }
            rute.classList.add("ikkeOpnet"); // Gi klassen ikkeOpnet for de nye rutene
            rute.id = `y${i}x${j}`; // Gi dem id som står for ruten de er

            var parentElement = document.getElementById("y" + i);

            parentElement.appendChild(rute); // Sett span elementene (rutene) inn i div elementene (radene)
        }
    }

    eventListener(); // Når spillet er lagd kjøres en funskjon som setter eventlisteners på hvert element
}

// Justere størrelsen til spillet når vinduet forandrer størrelse
document.getElementsByTagName("body")[0].onresize = function() {
    var elems = document.getElementsByTagName("span");
    if (innerWidth < breddeGameSection) {
        storrelsePerRute = Math.floor(innerWidth / inputBredde) - 3;
        fontSizeEmoji = storrelsePerRute * 3 / 4;

        for (var i = 0; i < elems.length; i++) {
            elems[i].style.height = storrelsePerRute + "px";
            elems[i].style.width = storrelsePerRute + "px";
            if (elems[i].className.includes("opnet") == false) {
                elems[i].style.fontSize = storrelsePerRute + "px";
            } else {
                elems[i].style.fontSize = fontSizeEmoji + "px";
            }
        }
    }
};

function eventListener() { // Looper gjennom alle elementene
    for (var i = 0; i < inputHoyde; i++) {
        for (var j = 0; j < inputBredde; j++) {
            (function() {
                var element = document.getElementById(`y${i}x${j}`)
                element.addEventListener("mousedown", function(e) {
                    if (forsteKlikk) { // Hvis man trykker for første gang, lagres starttiden og timeren starter
                        startTid = Date.now();
                        intervall = setInterval(function() {
                            document.getElementById("tid").innerHTML = `Tid: ${(Date.now()-startTid) / 1e3}s`
                        }, 1);
                    }
                    if (e.button == 2) { // Høyretrykk
                        forsteKlikk = false; // Nå har man trykket, ikke lengre første klikk
                        if (element.classList.contains("flagged")) { // Hvis ruta som høyretrykkes har et flagg fjernes flagget
                            element.classList.remove("flagged");
                            element.classList.add("ikkeOpnet");
                            element.style.fontSize = storrelsePerRute + "px";
                            element.innerHTML = "";
                        } else if (element.classList.contains("ikkeOpnet")) { // Hvis ruta ikke er åpnet og har ikke et flagg, får den et flagg
                            element.classList.remove("ikkeOpnet");
                            element.classList.add("flagged");
                            element.style.fontSize = fontSizeEmoji + "px";
                            element.innerHTML = flagg;
                        }
                        bomberIgjen(); // Oppdater antall bomber igjen
                    } else if (e.button == 0 && element.classList.contains("ikkeOpnet")) { // Hvis venstretrykk og en rute ikke er åpnet (og ikke flagget)
                        var yPos = finnYPosisjonFraId(element); // Får y posisjonen til ruten ut fra iden
                        var xPos = finnXPosisjonFraId(element); // Får y posisjonen til ruten ut fra iden

                        if (forsteKlikk && kart[yPos][xPos] != 0) { // Hvis man trukker for første gang og ruta ikke er 0, lag et nytt kart
                            createMap(inputBredde, inputHoyde, inputBomber);
                            forsokASnuForsteSomNull(yPos, xPos); // Som det står, prøv å snu første som 0
                        } else { // Hvis ruta er 0 eller man allerede har trykka snus ruta
                            snu(yPos, xPos);
                        }
                    }
                });
            }());
        }
    }

}

gamesection.addEventListener('contextmenu', event => event.preventDefault()); // Skru av menyen ved høyretrykk i spillfeltet

// Finn tilfeldig rute å ha bombe i
function randomPos() {
    x = Math.floor(Math.random() * inputBredde)
    y = Math.floor(Math.random() * inputHoyde)
    return x, y;
}

// Finn Y posisjon til en rute ut fra dens id
function finnYPosisjonFraId(element) {
    var yPos = "";
    for (var z = 1; z < element.id.indexOf("x") - element.id.indexOf("y"); z++) {
        yPos += element.id[z].toString();
    }
    return yPos;
}

// Finn X posisjon til en rute ut fra dens id
function finnXPosisjonFraId(element) {
    var xPos = "";
    for (var z = element.id.indexOf("x") + 1; z < element.id.length; z++) {
        xPos += element.id[z].toString();
    }
    return xPos;
}

// Snu en rute med gitt y og x verdi
function snu(yPos, xPos) {
    forsteKlikk = false; // Trykker man, har man ikke lenger ikke trykka
    element = document.getElementById(`y${yPos}x${xPos}`); // definerer hvilket element det jobbes med
    element.classList.remove("ikkeOpnet"); // Fjern classen ikkeOpnet...
    element.classList.add("opnet"); // ... og legg til opnet ...
    element.classList.add(kart[yPos][xPos]); // ... og hvilken verdi ruta har
    // Hvis man åpner en rute med bombe, slutter spillet
    if (element.classList.contains(bombe)) {
        gameOverTap(element); // Spesifisert hvilket element som gjorde at man tapte
        element.style.fontSize = fontSizeEmoji + "px";
    }
    element.innerHTML = kart[yPos][xPos]; // Gi ruta i HTML verdien den skal ha når den er åpen

    loopGjennomKart(); // Som det står, loop gjennom
}

// Hvis man er på første trykk, skal man alltid starte med å åpne en rute med 0 bomber rundt seg
function forsokASnuForsteSomNull(yPos, xPos) {
    while (kart[yPos][xPos] != 0) { // Hvis posisjonen ikke er 0, lag nytt kart til den er 0
        createMap(inputBredde, inputHoyde, inputBomber);
    }
    forsteKlikk = false;
    snu(yPos, xPos); // Når ruta er 0, snu den
}

function loopGjennomKart() {
    for (var i = 0; i < inputHoyde; i++) {
        for (var j = 0; j < inputBredde; j++) {

            // Åpne alle ruter rundt når en rute er null
            if (document.getElementById(`y${i}x${j}`).classList.contains("0")) {

                // Hvis du heller vil ha tallet 0 i spillfeltet enn en tom rute, fjern eller kommenter bort neste linje
                document.getElementById(`y${i}x${j}`).innerHTML = "";

                if (i > 0) { // Hvis ikke øverste rad
                    if (document.getElementById(`y${i - 1}x${j}`).classList.contains("ikkeOpnet")) snu(i - 1, j); // Snu ruta over
                    if (j > 0 && document.getElementById(`y${i - 1}x${j - 1}`).classList.contains("ikkeOpnet")) snu(i - 1, j - 1); // Snu ruta over til venstre (hvis den ikke er på første kolonne)
                    if (j < inputBredde - 1 && document.getElementById(`y${i - 1}x${j + 1}`).classList.contains("ikkeOpnet")) snu(i - 1, j + 1); // Snu ruta over til høyre (hvis den ikke er på siste kolonne)
                };

                if (j < inputBredde - 1 && document.getElementById(`y${i}x${j + 1}`).classList.contains("ikkeOpnet")) snu(i, j + 1); // Snu ruta til høyre (hvis den ikke er på siste kolonne)
                if (j > 0 && document.getElementById(`y${i}x${j - 1}`).classList.contains("ikkeOpnet")) snu(i, j - 1); // Snu ruta til venstre (hvis den ikke er på første kolonne)

                if (i < inputHoyde - 1) { // Hvis ikke siste rad
                    if (document.getElementById(`y${i + 1}x${j}`).classList.contains("ikkeOpnet")) snu(i + 1, j); // Snu ruta under
                    if (j < inputBredde - 1 && document.getElementById(`y${i + 1}x${j + 1}`).classList.contains("ikkeOpnet")) snu(i + 1, j + 1); // Snu ruta under til høyre (hvis den ikke er på siste kolonne)
                    if (j > 0 && document.getElementById(`y${i + 1}x${j - 1}`).classList.contains("ikkeOpnet")) snu(i + 1, j - 1); // Snu ruta under til venstre (hvis den ikke er på første kolonne)
                };
            }

        }
    }

    // Gi farge til tallene
    var localElement = document.getElementsByClassName("opnet"); // Finn alle åpnede elementer
    for (var i = 0; i < localElement.length; i++) {
        stilOpnet(localElement[i]); // Loop gjennom hver og gi dem stil
    }

    bomberIgjen(); // Oppdater antall bomber igjen

    // Seier hvis antall bomber som er igjen er likt antallet til uåpnede ruter (og man ikke allerede har tapt)
    if (document.getElementsByClassName("ikkeOpnet").length == antallBomberIgjen && !tapt) {
        gameOverSeier();
    }
}

function bomberIgjen() {
    flaggPlassert = document.getElementsByClassName("flagged").length; // Antall flagg igjen
    antallBomberIgjen = inputBomber - flaggPlassert; // Antall bomber igjen
    document.getElementById("bomberIgjen").innerHTML = `Bomber igjen: ${antallBomberIgjen}`; // Oppdater bomber igjen i HTML
}


function stilOpnet(element) {
    if (element.classList.contains("1")) { // Gir ruter med tallet 1 farge
        element.style.color = "red"
    } else if (element.classList.contains("2")) { // Gir ruter med tallet 2 farge
        element.style.color = "blue";
    } else if (element.classList.contains("3")) { // Gir ruter med tallet 3 farge
        element.style.color = "green";
    } else if (element.classList.contains("4")) { // Gir ruter med tallet 4 farge
        element.style.color = "purple";
    } else if (element.classList.contains("5")) { // Gir ruter med tallet 5 farge
        element.style.color = "magenta";
    } else if (element.classList.contains("6")) { // Gir ruter med tallet 6 farge
        element.style.color = "#cdff7d";
    } else if (element.classList.contains("7")) { // Gir ruter med tallet 7 farge
        element.style.color = "#cb87ff";
    } else if (element.classList.contains("8")) { // Gir ruter med tallet 8 farge
        element.style.color = "#ffdfba";
    }
}

function gameOverTap(elm) {
    tapt = true; // Man har tapt, variabelen på tilsi det (har dette for å ikke med uhell vinne selv om man har tapt)
    elm.style.backgroundColor = "red"; // Bomben som gjorde at man tapte blir rød
    gamesection.style.pointerEvents = "none"; // Kan ikke lengre trykke på noen ting i spillefeltet
    snuBomber(); // Snu ruter med bomber
    resultat.innerHTML = "Du tapte!"; // Oppdater informasjon for bruker
    clearInterval(intervall); // Stopp tidtakingen
}

function snuBomber() {
    for (var i = 0; i < inputHoyde; i++) {
        for (var j = 0; j < inputBredde; j++) { // Loop gjennom hele kartet
            var element = document.getElementById(`y${i}x${j}`);

            if (kart[i][j] == bombe && element.innerHTML != flagg) { // Viser umarkerte bomber
                element.classList.add(kart[i][j]); // Legg til klassen den skal ha nå som den er snudd
                element.style.fontSize = fontSizeEmoji + "px";
                element.innerHTML = kart[i][j]; // Vis bomben
                element.classList.add("opnet");
                element.classList.remove("ikkeOpnet"); // Ikke lenger ikke åpnet

            } else if (kart[i][j] != bombe && element.innerHTML == flagg) { // Markert bombe feil
                element.classList.add(kart[i][j]); // Legg til klassen den skal ha nå som den er snudd
                element.style.fontSize = fontSizeEmoji + "px";
                element.innerHTML = feilFlaggPlassering; // Vis rødt kryss for steder man trodde var bombe, men ikke var det
                element.classList.add("opnet");
                element.classList.remove("ikkeOpnet"); // Ikke lenger ikke åpnet
            }
        }
    }
}

function gameOverSeier() {
    gamesection.style.pointerEvents = "none"; // Ikke lov å trykke noen steder i spillområdet
    totalTid = (Date.now() - startTid) / 1e3; // Definerer totaltiden (1e3 = 1000)
    clearInterval(intervall); // Stopp intervallet
    document.getElementById("tid").innerHTML = `Tid: ${totalTid}s`;
    resultat.innerHTML = `Du vant med tiden ${totalTid} sekunder!`; // Oppdater tid-informasjon for bruker
}

document.addEventListener("keypress", function (e) {
    if (e.key === 'Enter' || e.code == "KeyR") {
        startSpill();
    }
});
