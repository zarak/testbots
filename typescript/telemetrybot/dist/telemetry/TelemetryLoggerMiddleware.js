"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License
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
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var telemetryConstants_1 = require("./telemetryConstants");
/**
 * Middleware for logging incoming, outgoing, updated or deleted Activity messages into Application Insights.
 * In addition, registers the telemetry client in the context so other Application Insights
 * components can log telemetry.
 * If this Middleware is removed, all the other sample components don't log (but still operate).
 */
var TelemetryLoggerMiddleware = /** @class */ (function () {
    // tslint:enable:variable-name
    /**
     * Initializes a new instance of the TelemetryLoggerMiddleware class.
     * @param instrumentationKey The Application Insights instrumentation key.  See Application Insights for more information.
     * @param logUsername (Optional) Enable/Disable logging user name within Application Insights.
     * @param logOriginalMessage (Optional) Enable/Disable logging original message name within Application Insights.
     */
    function TelemetryLoggerMiddleware(telemetryClient, logUsername, logOriginalMessage) {
        if (logUsername === void 0) { logUsername = false; }
        if (logOriginalMessage === void 0) { logOriginalMessage = false; }
        this.telemetryConstants = new telemetryConstants_1.TelemetryConstants();
        if (!telemetryClient) {
            throw new Error('Error not found');
        }
        this.telemetryClient = telemetryClient;
        this._logUsername = logUsername;
        this._logOriginalMessage = logOriginalMessage;
    }
    Object.defineProperty(TelemetryLoggerMiddleware.prototype, "logUsername", {
        /**
         * Gets a value indicating whether indicates whether to log the original message into the BotMessageReceived event.
         */
        get: function () { return this._logUsername; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TelemetryLoggerMiddleware.prototype, "logOriginalMessage", {
        /**
         * Gets a value indicating whether indicates whether to log the user name into the BotMessageReceived event.
         */
        get: function () { return this._logOriginalMessage; },
        enumerable: true,
        configurable: true
    });
    /**
     * Records incoming and outgoing activities to the Application Insights store.
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline
     */
    TelemetryLoggerMiddleware.prototype.onTurn = function (context, next) {
        return __awaiter(this, void 0, void 0, function () {
            var activity;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("context", context);
                        if (context === null) {
                            throw new Error('context is null');
                        }
                        context.turnState.set(TelemetryLoggerMiddleware.appInsightsServiceKey, this.telemetryClient);
                        // log incoming activity at beginning of turn
                        if (context.activity !== null) {
                            activity = context.activity;
                            // Log the Application Insights Bot Message Received
                            this.telemetryClient.trackEvent({
                                name: TelemetryLoggerMiddleware.botMsgReceiveEvent,
                                properties: this.fillReceiveEventProperties(activity)
                            });
                        }
                        // hook up onSend pipeline
                        context.onSendActivities(function (ctx, activities, nextSend) { return __awaiter(_this, void 0, void 0, function () {
                            var responses;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, nextSend()];
                                    case 1:
                                        responses = _a.sent();
                                        activities.forEach(function (activity) { return _this.telemetryClient.trackEvent({
                                            name: TelemetryLoggerMiddleware.botMsgSendEvent,
                                            properties: _this.fillSendEventProperties(activity)
                                        }); });
                                        return [2 /*return*/, responses];
                                }
                            });
                        }); });
                        // hook up update activity pipeline
                        context.onUpdateActivity(function (ctx, activity, nextUpdate) { return __awaiter(_this, void 0, void 0, function () {
                            var response;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, nextUpdate()];
                                    case 1:
                                        response = _a.sent();
                                        this.telemetryClient.trackEvent({
                                            name: TelemetryLoggerMiddleware.botMsgSendEvent,
                                            properties: this.fillUpdateEventProperties(activity)
                                        });
                                        return [2 /*return*/, response];
                                }
                            });
                        }); });
                        // hook up delete activity pipeline
                        context.onDeleteActivity(function (ctx, reference, nextDelete) { return __awaiter(_this, void 0, void 0, function () {
                            var deletedActivity;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: 
                                    // run full pipeline
                                    return [4 /*yield*/, nextDelete()];
                                    case 1:
                                        // run full pipeline
                                        _a.sent();
                                        deletedActivity = botbuilder_1.TurnContext.applyConversationReference({
                                            type: botbuilder_1.ActivityTypes.MessageDelete,
                                            id: reference.activityId
                                        }, reference, false);
                                        this.telemetryClient.trackEvent({
                                            name: TelemetryLoggerMiddleware.botMsgSendEvent,
                                            properties: this.fillDeleteEventProperties(deletedActivity)
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        console.log("telemetryClient", this.telemetryClient);
                        if (!(next !== null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, next()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fills the Application Insights Custom Event properties for BotMessageReceived.
     * These properties are logged in the custom event when a new message is received from the user.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageReceived Message.
     */
    TelemetryLoggerMiddleware.prototype.fillReceiveEventProperties = function (activity) {
        var properties = {};
        properties[this.telemetryConstants.activityIdProperty] = activity.id || '';
        properties[this.telemetryConstants.channelIdProperty] = activity.channelId;
        properties[this.telemetryConstants.fromIdProperty] = activity.from.id || '';
        properties[this.telemetryConstants.localeProperty] = activity.locale || '';
        properties[this.telemetryConstants.recipientIdProperty] = activity.recipient.id;
        properties[this.telemetryConstants.recipientNameProperty] = activity.recipient.name;
        // For some customers,
        // logging user name within Application Insights might be an issue so have provided a config setting to disable this feature
        if (this._logUsername && activity.from.name && activity.from.name.trim()) {
            properties[this.telemetryConstants.fromNameProperty] = activity.from.name;
        }
        // For some customers,
        // logging the utterances within Application Insights might be an so have provided a config setting to disable this feature
        if (this._logOriginalMessage && activity.text && activity.text.trim()) {
            properties[this.telemetryConstants.textProperty] = activity.text;
        }
        return properties;
    };
    /**
     * Fills the Application Insights Custom Event properties for BotMessageSend.
     * These properties are logged in the custom event when a response message is sent by the Bot to the user.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageSend Message.
     */
    TelemetryLoggerMiddleware.prototype.fillSendEventProperties = function (activity) {
        var properties = {};
        properties[this.telemetryConstants.activityIdProperty] = activity.id || '';
        properties[this.telemetryConstants.channelIdProperty] = activity.channelId;
        properties[this.telemetryConstants.replyActivityIdProperty] = activity.replyToId || '';
        properties[this.telemetryConstants.recipientIdProperty] = activity.recipient.id;
        properties[this.telemetryConstants.conversationNameProperty] = activity.conversation.name;
        properties[this.telemetryConstants.localeProperty] = activity.locale || '';
        properties[this.telemetryConstants.recipientNameProperty] = activity.recipient.name;
        // For some customers,
        // logging the utterances within Application Insights might be an so have provided a config setting to disable this feature
        if (this._logUsername && activity.recipient.name && activity.recipient.name.trim()) {
            properties[this.telemetryConstants.recipientNameProperty] = activity.recipient.name;
        }
        // For some customers,
        // logging the utterances within Application Insights might be an so have provided a config setting to disable this feature
        if (this._logOriginalMessage && activity.text && activity.text.trim()) {
            properties[this.telemetryConstants.textProperty] = activity.text;
        }
        return properties;
    };
    /**
     * Fills the Application Insights Custom Event properties for BotMessageUpdate.
     * These properties are logged in the custom event when an activity message is updated by the Bot.
     * For example, if a card is interacted with by the use, and the card needs to be updated to reflect
     * some interaction.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageUpdate Message.
     */
    TelemetryLoggerMiddleware.prototype.fillUpdateEventProperties = function (activity) {
        var properties = {};
        properties[this.telemetryConstants.channelIdProperty] = activity.channelId;
        properties[this.telemetryConstants.recipientIdProperty] = activity.recipient.id;
        properties[this.telemetryConstants.conversationIdProperty] = activity.conversation.id;
        properties[this.telemetryConstants.conversationNameProperty] = activity.conversation.name;
        properties[this.telemetryConstants.localeProperty] = activity.locale || '';
        // For some customers,
        // logging the utterances within Application Insights might be an so have provided a config setting to disable this feature
        if (this._logOriginalMessage && activity.text && activity.text.trim()) {
            properties[this.telemetryConstants.textProperty] = activity.text;
        }
        return properties;
    };
    /**
     * Fills the Application Insights Custom Event properties for BotMessageDelete.
     * These properties are logged in the custom event when an activity message is deleted by the Bot.  This is a relatively rare case.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageDelete Message.
     */
    TelemetryLoggerMiddleware.prototype.fillDeleteEventProperties = function (activity) {
        var properties = {};
        properties[this.telemetryConstants.channelIdProperty] = activity.channelId;
        properties[this.telemetryConstants.recipientIdProperty] = activity.recipient.id;
        properties[this.telemetryConstants.conversationIdProperty] = activity.conversation.id;
        properties[this.telemetryConstants.conversationNameProperty] = activity.conversation.name;
        return properties;
    };
    TelemetryLoggerMiddleware.appInsightsServiceKey = 'TelemetryLoggerMiddleware.AppInsightsContext';
    /**
     * Application Insights Custom Event name, logged when new message is received from the user
     */
    TelemetryLoggerMiddleware.botMsgReceiveEvent = 'BotMessageReceived';
    /**
     * Application Insights Custom Event name, logged when a message is sent out from the bot
     */
    TelemetryLoggerMiddleware.botMsgSendEvent = 'BotMessageSend';
    /**
     * Application Insights Custom Event name, logged when a message is updated by the bot (rare case)
     */
    TelemetryLoggerMiddleware.botMsgUpdateEvent = 'BotMessageUpdate';
    /**
     * Application Insights Custom Event name, logged when a message is deleted by the bot (rare case)
     */
    TelemetryLoggerMiddleware.botMsgDeleteEvent = 'BotMessageDelete';
    return TelemetryLoggerMiddleware;
}());
exports.TelemetryLoggerMiddleware = TelemetryLoggerMiddleware;
//# sourceMappingURL=TelemetryLoggerMiddleware.js.map