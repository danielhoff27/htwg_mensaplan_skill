/**
 * Parser um eine HTML, welche als Datei im Verzeichnis vorliegt, in eine JSON umzuwandeln.
 * Liest im ersten Schritt die html ein
 * extrahiert relevante Dinge aus html
 * wandelt diese um (mit hilffunktionen, z.b. bei Datum z.b. in YYYY-MM-DD)
 * stellt json-String zusammen und schreibt diesen in eine Datei (outputMenu.json)
 */

const fs = require('fs');
const htmlMenu = './menuPlan.html';
//const menuData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
//const axios =require('axios');
const cheerio = require('cheerio');
const htmlCode = fs.readFileSync(htmlMenu, 'utf-8');
//const dateHelper = require('./dateHelper');
const { inherits } = require('util');

const regexRemoveSup = new RegExp('\\([0-9a-z,]*\\)', 'g');
const regexRemoveCharacters = new RegExp('[\\|\\(\\\\"),]', 'g');
const regexRemoveSpacing = new RegExp('\\s{2,}', 'g');
const regexRemovePriceSpacing = new RegExp('\\s', 'g');
const regexRemoveDay = new RegExp('^\\s[a-zA-Z]*\\.\\s', 'g');
const regexRemoveBrake = new RegExp('\\)\\s+\\(', 'g');


const $ = cheerio.load(htmlCode);

// auf Basis von bereitgestellter Methode getSpeiseplan() angepassst und erweitert
// Hauptfunktionn des Parser
// erstellt eine json mit Menue für jeden Tag
function mainParse() {
    let allDates = [];
    var outputJSON = {};
    const date = {};
    const menus = {};
    for (let i = 1; i < 11; i++) {
        const speisePlan = $('.contents_' + i + '> .speiseplanTagKat ');
        let date = $('.tx-speiseplan > .tabs > .tab' + i).text().replace(regexRemoveDay, '').replace(regexRemoveSpacing, '');
        let formattedDate = dateToAmazon(date);
        menus[formattedDate] = {};
        speisePlan.each(function () {
            menus[formattedDate][menuTitle($(this))] = {
                "description": menuDescription($(this)),
                "price": menuPrice($(this)),
                "inhaltsstoffe": menuIngriedients($(this)),
                "kategorie": menuCategory($(this))
            }
        });
        allDates.push(formattedDate);
    }
    const resultJson = {
        'menus': menus
    };
    const jsonSting = JSON.stringify(resultJson, null, 4);
    fs.writeFileSync('outputMenu.json', jsonSting);
}


// extrahiert die Zusatzstoffe der Gerichte
// @param speisePlan - Cheerio-Element, das den Speiseplan repräsentiert
// @returns {string[]} - array mit Zusatzstoffen
function menuIngriedients(speisePlan) {
    let description = speisePlan.find('.title').text();
    const supElements = speisePlan.find('sup');
    let supContent = '';
    supElements.each(function () {
        supContent += $(this).text() + ' ';
    });
    // Entferne zusätzliche Zeichen und Leerzeichen
    let out = supContent.replace(regexRemoveSpacing, ' ')
        .replace(regexRemoveBrake, ', ')
        .replace(regexRemoveCharacters, ' ')
        .replace(new RegExp('\\s{1,}', 'g'), ',')
        .replace(new RegExp('^,', 'g'), '')
        .replace(new RegExp(',$', 'g'), '')
        .split(',')
        out.forEach((element, index, array) => {
            array[index] = element.toLowerCase();
        });
    return [...new Set(out)].filter(item => item.trim() !== '');
}

// extrahiert die Kategorien der Gerichte
// @param speisePlan - Cheerio-Element, das den Speiseplan repräsentiert
// @returns {string[]} - array mit Kategorien
function menuCategory(speisePlan) {
    const icons = $(speisePlan).find('.title_preise_2 .speiseplanTagKatIcon');
    const categories = icons.map((j, icon) => $(icon).attr('class').split(' ')[1]).get();
    categories.forEach((getFullNameCategory));
    return categories;

}


// wandelt den Kurznamen in den vollständigen Namen um
// @param short - objekt in array
// @param index - stelle des array
// @param array - array mit string der kategorien
function getFullNameCategory(short, index, array) {
    switch (short) {
        case 'Veg':
            array[index] = 'vegetarisch';
            break;
        case 'Vegan':
            array[index] = 'vegan';
            break;
        case 'Sch':
            array[index] = 'schwein';
            break;
        case 'R':
            array[index] = 'rind';
            break;
        case 'G':
            array[index] = 'geflügel';
            break;
        case 'L':
            array[index] = 'lamm';
            break;
        case 'W':
            array[index] = 'wild';
            break;
        case 'F':
            array[index] = 'fisch';
            break;
            case 'B':
            array[index] = 'bessere tierhaltung';
            break;
        default:
            //array[index] = '';
    }
}

// wandelt datum in YYYY-MM-DD um
// @param date - unformatiertes Datum
// @returns {string} - formatiertes Datum
function dateToAmazon(date) {
    const dateArray = date.split('.');
    const day = dateArray[0].padStart(2, '0');
    const month = dateArray[1].padStart(2, '0');
    const year = (new Date()).getFullYear();
    return `${year}-${month}-${day}`;
}

// bereitgestellt
// @param speisePlan - Cheerio-Element, das den Speiseplan repräsentiert
// @returns {string} - Gerichtart
function menuTitle(speisePlan) {
    return speisePlan.find('.category').text().toLowerCase();
}

// bereitgestellt und erweitert
// extrahiert die beschreibung des Gerichtes
// @param speisePlan - Cheerio-Element, das den Speiseplan repräsentiert
// @returns {string} - beschreibung
// @returns {string[]} - array mit beilagen
function menuDescription(speisePlan) {
    let description = speisePlan.find('.title').text();
    const supElements = speisePlan.find('sup');
    supElements.each(function () {
        description = description.replace($(this).text(), '');
    });

    //Check if menu description is from beilagen
    if (description.includes("|")) {
        return handleMenuBeilagen(description);
    } else {
        let shortDescription =description.replace(regexRemoveCharacters, '').replace(regexRemoveSpacing, ' ').toLowerCase().trim();
        if(shortDescription === '[kri]werk®'){
            shortDescription = 'köriwerk';
        }
        return shortDescription;
    }
}


// bereitgestellt und erweitert
// @param beilagen - string mit beilagen
// @returns {string[]} - array mit formatierten beilagen
function handleMenuBeilagen(beilagen) {
    let out = beilagen.replace(regexRemoveSup, '')
        .replace(new RegExp('\\n*', 'g'), '')
        .toLowerCase()
        .replace(regexRemoveSpacing, ' ')
        .split("|");
        out.forEach((element, index, array) => {
            array[index] = element.trim();
        });
        return out;
}

// bereitgestellt
// checks if current menu has a price and if so, creates js object of it
// return: js object, eg: { "Studierende" : "5,95€" }
function menuPrice(speisePlan) {
    let p = speisePlan.find('.preise').text();
    let preis = p.replace(regexRemovePriceSpacing, '');
    if (preis !== "") {
        var preisList = preis.replace(regexRemoveSup).split("|");
        var preisObject = {};
        for (let i = 0; i < preisList.length; i++) {
            let preisVariable = preisList[i].split("€");
            let preisValue = parseFloat(preisVariable[0].replace(',', '.'));
            preisObject[preisVariable[1]] = preisValue;
        }
        return preisObject;
    }
}

module.exports = {
    mainParse
};

