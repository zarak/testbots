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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const cancelAndHelpDialog_1 = require("./cancelAndHelpDialog");
const dateResolverDialog_1 = require("./dateResolverDialog");
const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
class BookingDialog extends cancelAndHelpDialog_1.CancelAndHelpDialog {
    constructor(id) {
        super(id || 'bookingDialog');
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new dateResolverDialog_1.DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(WATERFALL_DIALOG, [
            this.destinationStep.bind(this),
            this.originStep.bind(this),
            this.travelDateStep.bind(this),
            this.confirmStep.bind(this),
            this.finalStep.bind(this),
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }
    /**
     * If a destination city has not been provided, prompt for one.
     */
    destinationStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingDetails = stepContext.options;
            if (!bookingDetails.destination) {
                return yield stepContext.prompt(TEXT_PROMPT, { prompt: 'To what city would you like to travel?' });
            }
            else {
                return yield stepContext.next(bookingDetails.destination);
            }
        });
    }
    /**
     * If an origin city has not been provided, prompt for one.
     */
    originStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingDetails = stepContext.options;
            // Capture the response to the previous step's prompt
            bookingDetails.destination = stepContext.result;
            if (!bookingDetails.origin) {
                return yield stepContext.prompt(TEXT_PROMPT, { prompt: 'From what city will you be travelling?' });
            }
            else {
                return yield stepContext.next(bookingDetails.origin);
            }
        });
    }
    /**
     * If a travel date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    travelDateStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingDetails = stepContext.options;
            // Capture the results of the previous step
            bookingDetails.origin = stepContext.result;
            if (!bookingDetails.travelDate || this.isAmbiguous(bookingDetails.travelDate)) {
                return yield stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: bookingDetails.travelDate });
            }
            else {
                return yield stepContext.next(bookingDetails.travelDate);
            }
        });
    }
    /**
     * Confirm the information the user has provided.
     */
    confirmStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingDetails = stepContext.options;
            // Capture the results of the previous step
            bookingDetails.travelDate = stepContext.result;
            const msg = `Please confirm, I have you traveling to: ${bookingDetails.destination} from: ${bookingDetails.origin} on: ${bookingDetails.travelDate}.`;
            // Offer a YES/NO prompt.
            return yield stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
        });
    }
    /**
     * Complete the interaction and end the dialog.
     */
    finalStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (stepContext.result === true) {
                const bookingDetails = stepContext.options;
                return yield stepContext.endDialog(bookingDetails);
            }
            else {
                return yield stepContext.endDialog();
            }
        });
    }
    isAmbiguous(timex) {
        const timexPropery = new recognizers_text_data_types_timex_expression_1.TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}
exports.BookingDialog = BookingDialog;
//# sourceMappingURL=bookingDialog.js.map