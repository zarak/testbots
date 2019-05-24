"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const recognizers_text_data_types_timex_expression_1 = require("@microsoft/recognizers-text-data-types-timex-expression");
const bookingDetails_1 = require("./bookingDetails");
const bookingDialog_1 = require("./bookingDialog");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const luisHelper_1 = require("./luisHelper");
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const BOOKING_DIALOG = 'bookingDialog';
class MainDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(logger) {
        super('MainDialog');
        if (!logger) {
            logger = console;
            logger.log('[MainDialog]: logger not passed in, defaulting to console');
        }
        this.logger = logger;
        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new botbuilder_dialogs_1.TextPrompt('TextPrompt'))
            .addDialog(new bookingDialog_1.BookingDialog(BOOKING_DIALOG))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.introStep.bind(this),
            this.actStep.bind(this),
            this.finalStep.bind(this),
        ]));
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }
    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {TurnContext} context
     */
    run(context, accessor) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
            dialogSet.add(this);
            const dialogContext = yield dialogSet.createContext(context);
            const results = yield dialogContext.continueDialog();
            if (results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
                yield dialogContext.beginDialog(this.id);
            }
        });
    }
    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    introStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.LuisAppId || !process.env.LuisAPIKey || !process.env.LuisAPIHostName) {
                yield stepContext.context.sendActivity('NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.');
                return yield stepContext.next();
            }
            return yield stepContext.prompt('TextPrompt', { prompt: 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"' });
        });
    }
    /**
     * Second step in the waterall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    actStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let bookingDetails = new bookingDetails_1.BookingDetails();
            if (process.env.LuisAppId && process.env.LuisAPIKey && process.env.LuisAPIHostName) {
                // Call LUIS and gather any potential booking details.
                // This will attempt to extract the origin, destination and travel date from the user's message
                // and will then pass those values into the booking dialog
                bookingDetails = yield luisHelper_1.LuisHelper.executeLuisQuery(this.logger, stepContext.context);
                this.logger.log('LUIS extracted these booking details:', bookingDetails);
            }
            // In this sample we only have a single intent we are concerned with. However, typically a scenario
            // will have multiple different intents each corresponding to starting a different child dialog.
            // Run the BookingDialog giving it whatever details we have from the LUIS call, it will fill out the remainder.
            return yield stepContext.beginDialog('bookingDialog', bookingDetails);
        });
    }
    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    finalStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
            if (stepContext.result) {
                const result = stepContext.result;
                // Now we have all the booking details.
                // This is where calls to the booking AOU service or database would go.
                // If the call to the booking service was successful tell the user.
                const timeProperty = new recognizers_text_data_types_timex_expression_1.TimexProperty(result.travelDate);
                const travelDateMsg = timeProperty.toNaturalLanguage(new Date(Date.now()));
                const msg = `I have you booked to ${result.destination} from ${result.origin} on ${travelDateMsg}.`;
                yield stepContext.context.sendActivity(msg);
            }
            else {
                yield stepContext.context.sendActivity('Thank you.');
            }
            return yield stepContext.endDialog();
        });
    }
}
exports.MainDialog = MainDialog;
//# sourceMappingURL=mainDialog.js.map