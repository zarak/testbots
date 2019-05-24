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
const DATETIME_PROMPT = 'datetimePrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
class DateResolverDialog extends cancelAndHelpDialog_1.CancelAndHelpDialog {
    static dateTimePromptValidator(promptContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (promptContext.recognized.succeeded) {
                // This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
                // TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
                const timex = promptContext.recognized.value[0].timex.split('T')[0];
                // If this is a definite Date including year, month and day we are good otherwise reprompt.
                // A better solution might be to let the user know what part is actually missing.
                return new recognizers_text_data_types_timex_expression_1.TimexProperty(timex).types.has('definite');
            }
            else {
                return false;
            }
        });
    }
    constructor(id) {
        super(id || 'dateResolverDialog');
        this.addDialog(new botbuilder_dialogs_1.DateTimePrompt(DATETIME_PROMPT, DateResolverDialog.dateTimePromptValidator.bind(this)))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.finalStep.bind(this),
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }
    initialStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const timex = stepContext.options.date;
            const promptMsg = 'On what date would you like to travel?';
            const repromptMsg = 'I\'m sorry, for best results, please enter your travel date including the month, day and year.';
            if (!timex) {
                // We were not given any date at all so prompt the user.
                return yield stepContext.prompt(DATETIME_PROMPT, {
                    prompt: promptMsg,
                    retryPrompt: repromptMsg,
                });
            }
            else {
                // We have a Date we just need to check it is unambiguous.
                const timexProperty = new recognizers_text_data_types_timex_expression_1.TimexProperty(timex);
                if (!timexProperty.types.has('definite')) {
                    // This is essentially a "reprompt" of the data we were given up front.
                    return yield stepContext.prompt(DATETIME_PROMPT, { prompt: repromptMsg });
                }
                else {
                    return yield stepContext.next({ timex });
                }
            }
        });
    }
    finalStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const timex = stepContext.result[0].timex;
            return yield stepContext.endDialog(timex);
        });
    }
}
exports.DateResolverDialog = DateResolverDialog;
//# sourceMappingURL=dateResolverDialog.js.map