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
const bookingDetails_1 = require("./bookingDetails");
const botbuilder_ai_1 = require("botbuilder-ai");
class LuisHelper {
    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {Logger} logger
     * @param {TurnContext} context
     */
    static executeLuisQuery(logger, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingDetails = new bookingDetails_1.BookingDetails();
            try {
                const recognizer = new botbuilder_ai_1.LuisRecognizer({
                    applicationId: process.env.LuisAppId,
                    endpoint: `https://${process.env.LuisAPIHostName}`,
                    endpointKey: process.env.LuisAPIKey,
                }, {}, true);
                const recognizerResult = yield recognizer.recognize(context);
                const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult);
                bookingDetails.intent = intent;
                if (intent === 'Book_flight') {
                    // We need to get the result from the LUIS JSON which at every level returns an array
                    bookingDetails.destination = LuisHelper.parseCompositeEntity(recognizerResult, 'To', 'Airport');
                    bookingDetails.origin = LuisHelper.parseCompositeEntity(recognizerResult, 'From', 'Airport');
                    // This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
                    // TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
                    bookingDetails.travelDate = LuisHelper.parseDatetimeEntity(recognizerResult);
                }
            }
            catch (err) {
                logger.warn(`LUIS Exception: ${err} Check your LUIS configuration`);
            }
            return bookingDetails;
        });
    }
    static parseCompositeEntity(result, compositeName, entityName) {
        const compositeEntity = result.entities[compositeName];
        if (!compositeEntity || !compositeEntity[0]) {
            return undefined;
        }
        const entity = compositeEntity[0][entityName];
        if (!entity || !entity[0]) {
            return undefined;
        }
        const entityValue = entity[0][0];
        return entityValue;
    }
    static parseDatetimeEntity(result) {
        const datetimeEntity = result.entities.datetime;
        if (!datetimeEntity || !datetimeEntity[0]) {
            return undefined;
        }
        const timex = datetimeEntity[0].timex;
        if (!timex || !timex[0]) {
            return undefined;
        }
        const datetime = timex[0].split('T')[0];
        return datetime;
    }
}
exports.LuisHelper = LuisHelper;
//# sourceMappingURL=luisHelper.js.map