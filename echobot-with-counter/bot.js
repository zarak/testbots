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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// bot.js is your bot's main entry point to handle incoming activities.
var botbuilder_1 = require("botbuilder");
// Turn counter property
var TURN_COUNTER_PROPERTY = 'turnCounterProperty';
var EchoBot = /** @class */ (function () {
    function EchoBot(conversationState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this._countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this._conversationState = conversationState;
    }
    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    EchoBot.prototype.onTurn = function (turnContext) {
        return __awaiter(this, void 0, void 0, function () {
            var count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(turnContext.activity.type === botbuilder_1.ActivityTypes.Message)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._countProperty.get(turnContext)];
                    case 1:
                        count = _a.sent();
                        count = count === undefined ? 1 : ++count;
                        return [4 /*yield*/, turnContext.sendActivity(count + ": You said \"" + turnContext.activity.text + "\"")];
                    case 2:
                        _a.sent();
                        // increment and set turn counter.
                        return [4 /*yield*/, this._countProperty.set(turnContext, count)];
                    case 3:
                        // increment and set turn counter.
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: 
                    // Generic handler for all other activity types.
                    return [4 /*yield*/, turnContext.sendActivity("[" + turnContext.activity.type + " event detected]")];
                    case 5:
                        // Generic handler for all other activity types.
                        _a.sent();
                        _a.label = 6;
                    case 6: 
                    // Save state changes
                    return [4 /*yield*/, this._conversationState.saveChanges(turnContext)];
                    case 7:
                        // Save state changes
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return EchoBot;
}());
exports.EchoBot = EchoBot;