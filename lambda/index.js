/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const fs = require('fs');
const jsonFilePath = './outputMenu.json';
const menuData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Herzlich Willkommen bei dem Alexa Skill für den Speiseplan der h t w g .';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const mealIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'mealIntent';
    },
    handle(handlerInput) {
        const { requestEnvelope } = handlerInput;
        const { intent } = requestEnvelope.request;

        let speakOutput = 'Leider habe ich das nicht verstanden.';
        let formattedDate;

        //if (intent.confirmationStatus === 'CONFIRMED'){
        /** 
        let intent = this.event.request.intent;
        let datum = intent.slots.datum;
        let kategorie = intent.slots.kategorie;
        let typ = intent.slots.typ;
        let slotsout= ('kategorie:' + kategorie + ' datum:' + datum+ ' typ'+ typ);
        */ 
        let date = Alexa.getSlotValue(requestEnvelope, 'datum');
        let category = Alexa.getSlotValue(requestEnvelope, 'kategorie');
        let type = Alexa.getSlotValue(requestEnvelope, 'typ');
        let slotsoutbefore= ('kategorie:' + category + ' datum:' + date+ ' typ'+ type);
        let typeNew;
        
        //Date standardmäßig auf aktuelles datum
        if (date !== undefined) {
            formattedDate = date;
            //console.log(formattedDate);
        } else {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const day = currentDate.getDate().toString().padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
        }

        if(category === undefined){
            category=null;
        }
        if(type === undefined){
            typeNew=null;
        }else {
            let typeSlot = Alexa.getSlot(requestEnvelope, 'typ');
            let typeName2 = typeSlot.slotValue.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            if(typeName2==='köriwerk'){
                typeNew='kœriwerk®';
            }else {
                typeNew =typeName2;
            }
        }
        let slotsoutafter= ('kategorie:' + category + ' datum:' + date+ ' typ'+ type);
        
        
        if (formattedDate && category && typeNew) {
            //Genau Abfrage nach allen Kategorien
            speakOutput = slotsoutbefore + 'Dein Essen für ' + formattedDate + ' der Kategorie ' + category + ' des Typ ' + type + ' wurde registriert1.'+slotsoutafter;

            if (menuData.menus.hasOwnProperty(formattedDate)){
                //Es gibt ein Essen an dem Tag
                
                if (menuData.menus[formattedDate].hasOwnProperty(typeNew)){
                    //Es gibt ein Essen des Typs an dem Tag
                    
                    const meal = menuData.menus[formattedDate][typeNew];
                    if(meal.kategorie.inculdes(category)){
                        //Es gibt ein Gericht mit der Kategorie
                        let mealName = meal.description;
                        speakOutput = 'Am '+formattedDate+' gibt es als '+type+mealName+'. Dieses Gericht ist mit '+category;
                    }else{
                        speakOutput = 'Am '+formattedDate+' gibt es als '+type+'leider kein Gericht mit '+category;
                    }
                } else {
                    speakOutput = 'Am '+formattedDate+' gibt es leider kein '+typeNew;
                }
                
            } else{
                speakOutput = 'Leider habe ich für den '+ formattedDate+' kein Speiseplan gefunden';
            }


        } else if (formattedDate && category) {
            //Datum und Kategorie
            speakOutput = 'Dein Essen für den ' + formattedDate + ' der Kategorie ' + category + ' wurde registriert.';

            if (menuData.menus.hasOwnProperty(formattedDate)){
                //Es gibt Essen an dem Tag
               let mealsString='';
                const allMeals = menuData.menus[formattedDate];
                for(const meal in allMeals){
                    if(allMeals.hasOwnProperty(meal)){
                        const oneMeal = allMeals[meal];

                        if(oneMeal.kategorie.includes(category)){
                            mealsString += 'als '+meal+' '+oneMeal.description+' ';
                        }

                    }
                }
                mealsString
                if(mealsString !== ''){
                    mealsString = mealsString.replace(/&/g, ' und ');
                    speakOutput = 'Am '+formattedDate+' gibt es mit '+category+': '+mealsString;
                } else{
                    speakOutput='Am '+formattedDate+' gibt es kein Gericht das '+category+' ist.';
                }
                    
            } else{
                speakOutput = 'Leider habe ich für den '+ formattedDate+' kein Speiseplan gefunden';
            }
        } else if (formattedDate && typeNew) {
            speakOutput = 'Dein Essen für den ' + formattedDate + ' des Typs ' + type + ' wurde registriert.';
            if (menuData.menus.hasOwnProperty(formattedDate)){
                //Es gibt ein Essen an dem Tag
                if (menuData.menus[formattedDate].hasOwnProperty(typeNew)){
                    //Es gibt ein Essen des Typs an dem Tag
                    //Obejekt speichern
                    const meal = menuData.menus[formattedDate][typeNew];
                    let mealName = meal.description;
                    speakOutput = 'Am '+formattedDate+' gibt es als '+type+' '+mealName+'.';
                    
                } else {
                    speakOutput = 'Am '+formattedDate+' gibt es leider kein '+type;
                }
                
            } else{
                speakOutput = 'Leider habe ich für den '+ formattedDate+' kein Speiseplan gefunden';
            }
        } else if (category && typeNew) {
            speakOutput = 'Dein Essen der Kategorie ' + category + ' des Typs ' + type + ' wurde registriert.';
        } else if (formattedDate) {
            speakOutput = slotsoutbefore + 'Dein Essen für den ' + formattedDate + ' wurde registriert. '+slotsoutafter;

            if (menuData.menus.hasOwnProperty(formattedDate)){
                let speakMeal='Es gibt ein essen an dem Tag';
                const dishesArray = Object.values(menuData.menus[formattedDate]).map(dish => dish.description);
                speakMeal= dishesArray.join(', ');
                speakOutput= 'Am '+formattedDate+' gibt es '+speakMeal;
            } else{
                speakOutput = 'Leider wurde für den '+ formattedDate+' kein Gericht gefunden';
            }
            
        } else if (category) {
            speakOutput = 'Dein Essen der Kategorie ' + category + ' wurde registriert.';
        } else if (typeNew) {
            speakOutput = 'Dein Essen des Typ ' + type + ' wurde registriert.';
        } else {
            speakOutput = slotsoutbefore + 'Eine Allgemeine Anfrage'+slotsoutafter;
        }


        //}

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};

const ingriedientsIntentHandler={
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ingriedientsIntentn';
    },
    handle(handlerInput) {
        let speakOutput='Dabei kann ich dir zurzeit leider nicht helfen';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const getMealInformationHandler={
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'mealInformationIntent';
    },
    handle(handlerInput){
        const speakOutput='Bei der Mensa wird Nachhaltigkeit sehr geschätzt. Es wird auf Regionalität, fairen Handel '+
        'und biologischen Anbau geachtet. Bei der Verarbeitung und Produktion wird energiesparend und ressourcenschonend gearbeitet.';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const isOpenIntentHandler ={
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'isOpenIntent';
    },
    handle(handlerInput){
        var currentDate = new Date();
        var currentHour = currentDate.getHours();
        var currentDay = currentDate.getDay();
        let speakOutput='Die Mensa ist Montag bis Freitag, von 11 Uhr bis 14 uhr geöffnet.'
        
        var isWeekday = currentDay >= 1 && currentDay <= 5;
        var isOpen = isWeekday && currentHour >= 11 && currentHour < 14;
        
        if(isOpen){
            speakOutput='Die Mensa ist aktuell geöffnet bis 14 Uhr.';
        }else{
            speakOutput='Aktuell ist die Mensa geschlossen. Sie hat Montag bis Freitag, von 11 Uhr bis 14 uhr geöffnet.'
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const priceIntentHandler={
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'priceIntent';
    },
    handle(handlerInput) {
        let speakOutput='Dabei kann ich dir zurzeit leider nicht helfen';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const specificMealIntentHandler={
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'specificMealIntent';
    },
    handle(handlerInput) {
        let speakOutput='Dabei kann ich dir zurzeit leider nicht helfen';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Gerne helfe ich dir. Du kannst mich zum Beispiel nach Informationen, wie das Gericht für morgen oder ob es etwas vegetarisches gibt fragen. ';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Auf Wiedersehen!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Tut mir leid, dabei kann ich dir leider nicht helfen.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Du hast gerade ${intentName} ausgelöst.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Anscheinend hatte etwas nicht so geklappt, wie es soll. Tut mir leid.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        mealIntentHandler,
        isOpenIntentHandler,
        getMealInformationHandler,
        ingriedientsIntentHandler,
        priceIntentHandler,
        specificMealIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();