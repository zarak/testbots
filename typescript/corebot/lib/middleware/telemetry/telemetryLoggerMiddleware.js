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
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const telemetryConstants_1 = require("./telemetryConstants");
/**
 * Middleware for logging incoming, outgoing, updated or deleted Activity messages into Application Insights.
 * In addition, registers the telemetry client in the context so other Application Insights
 * components can log telemetry.
 * If this Middleware is removed, all the other sample components don't log (but still operate).
 */
class TelemetryLoggerMiddleware {
    // tslint:enable:variable-name
    /**
     * Initializes a new instance of the TelemetryLoggerMiddleware class.
     * @param instrumentationKey The Application Insights instrumentation key.  See Application Insights for more information.
     * @param logUsername (Optional) Enable/Disable logging user name within Application Insights.
     * @param logOriginalMessage (Optional) Enable/Disable logging original message name within Application Insights.
     */
    constructor(telemetryClient, logUsername = false, logOriginalMessage = false) {
        this.telemetryConstants = new telemetryConstants_1.TelemetryConstants();
        if (!telemetryClient) {
            throw new Error('Error not found');
        }
        this.telemetryClient = telemetryClient;
        this._logUsername = logUsername;
        this._logOriginalMessage = logOriginalMessage;
    }
    /**
     * Gets a value indicating whether indicates whether to log the original message into the BotMessageReceived event.
     */
    get logUsername() { return this._logUsername; }
    /**
     * Gets a value indicating whether indicates whether to log the user name into the BotMessageReceived event.
     */
    get logOriginalMessage() { return this._logOriginalMessage; }
    /**
     * Records incoming and outgoing activities to the Application Insights store.
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline
     */
    onTurn(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context === null) {
                throw new Error('context is null');
            }
            context.turnState.set(TelemetryLoggerMiddleware.appInsightsServiceKey, this.telemetryClient);
            // log incoming activity at beginning of turn
            if (context.activity !== null) {
                const activity = context.activity;
                // Log the Application Insights Bot Message Received
                this.telemetryClient.trackEvent({
                    name: TelemetryLoggerMiddleware.botMsgReceiveEvent,
                    properties: this.fillReceiveEventProperties(activity)
                });
            }
            // hook up onSend pipeline
            context.onSendActivities((ctx, activities, nextSend) => __awaiter(this, void 0, void 0, function* () {
                // run full pipeline
                const responses = yield nextSend();
                activities.forEach((activity) => this.telemetryClient.trackEvent({
                    name: TelemetryLoggerMiddleware.botMsgSendEvent,
                    properties: this.fillSendEventProperties(activity)
                }));
                return responses;
            }));
            // hook up update activity pipeline
            context.onUpdateActivity((ctx, activity, nextUpdate) => __awaiter(this, void 0, void 0, function* () {
                // run full pipeline
                const response = yield nextUpdate();
                this.telemetryClient.trackEvent({
                    name: TelemetryLoggerMiddleware.botMsgSendEvent,
                    properties: this.fillUpdateEventProperties(activity)
                });
                return response;
            }));
            // hook up delete activity pipeline
            context.onDeleteActivity((ctx, reference, nextDelete) => __awaiter(this, void 0, void 0, function* () {
                // run full pipeline
                yield nextDelete();
                const deletedActivity = botbuilder_1.TurnContext.applyConversationReference({
                    type: botbuilder_1.ActivityTypes.MessageDelete,
                    id: reference.activityId
                }, reference, false);
                this.telemetryClient.trackEvent({
                    name: TelemetryLoggerMiddleware.botMsgSendEvent,
                    properties: this.fillDeleteEventProperties(deletedActivity)
                });
            }));
            if (next !== null) {
                yield next();
            }
        });
    }
    /**
     * Fills the Application Insights Custom Event properties for BotMessageReceived.
     * These properties are logged in the custom event when a new message is received from the user.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageReceived Message.
     */
    fillReceiveEventProperties(activity) {
        const properties = {};
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
    }
    /**
     * Fills the Application Insights Custom Event properties for BotMessageSend.
     * These properties are logged in the custom event when a response message is sent by the Bot to the user.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageSend Message.
     */
    fillSendEventProperties(activity) {
        const properties = {};
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
    }
    /**
     * Fills the Application Insights Custom Event properties for BotMessageUpdate.
     * These properties are logged in the custom event when an activity message is updated by the Bot.
     * For example, if a card is interacted with by the use, and the card needs to be updated to reflect
     * some interaction.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageUpdate Message.
     */
    fillUpdateEventProperties(activity) {
        const properties = {};
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
    }
    /**
     * Fills the Application Insights Custom Event properties for BotMessageDelete.
     * These properties are logged in the custom event when an activity message is deleted by the Bot.  This is a relatively rare case.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageDelete Message.
     */
    fillDeleteEventProperties(activity) {
        const properties = {};
        properties[this.telemetryConstants.channelIdProperty] = activity.channelId;
        properties[this.telemetryConstants.recipientIdProperty] = activity.recipient.id;
        properties[this.telemetryConstants.conversationIdProperty] = activity.conversation.id;
        properties[this.telemetryConstants.conversationNameProperty] = activity.conversation.name;
        return properties;
    }
}
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
exports.TelemetryLoggerMiddleware = TelemetryLoggerMiddleware;
//# sourceMappingURL=TelemetryLoggerMiddleware.js.map