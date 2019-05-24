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
const botbuilder_ai_1 = require("botbuilder-ai");
const qnaTelemetryConstants_1 = require("./qnaTelemetryConstants");
const telemetryLoggerMiddleware_1 = require("./telemetryLoggerMiddleware");
/**
 * TelemetryQnaRecognizer invokes the Qna Maker and logs some results into Application Insights.
 * Logs the score, and (optionally) questionAlong with Conversation and ActivityID.
 * The Custom Event name this logs is "QnaMessage"
 */
class TelemetryQnAMaker extends botbuilder_ai_1.QnAMaker {
    /**
     * Initializes a new instance of the TelemetryQnAMaker class.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param qnaOptions The options for the QnA Maker knowledge base.
     * @param logUsername The flag to include username in logs.
     * @param logOriginalMessage The flag to include original message in logs.
     */
    constructor(endpoint, qnaOptions, logUsername = false, logOriginalMessage = false) {
        super(endpoint, qnaOptions);
        // tslint:enable:variable-name
        this.qnaOptions = { top: 1, scoreThreshold: 0.3 };
        this.qnaTelemetryConstants = new qnaTelemetryConstants_1.QnATelemetryConstants();
        this._logUsername = logUsername;
        this._logOriginalMessage = logOriginalMessage;
        this.qnaMakerEndpoint = endpoint;
        Object.assign(this.qnaOptions, qnaOptions);
    }
    /**
     * Gets a value indicating whether determines whether to log the User name.
     */
    get logUsername() { return this._logUsername; }
    /**
     * Gets a value indicating whether determines whether to log the Activity message text that came from the user.
     */
    get logOriginalMessage() { return this._logOriginalMessage; }
    getAnswersAsync(context) {
        const _super = Object.create(null, {
            generateAnswer: { get: () => super.generateAnswer }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // Call Qna Maker
            const queryResults = yield _super.generateAnswer.call(this, context.activity.text, this.qnaOptions.top, this.qnaOptions.scoreThreshold);
            // Find the Application Insights Telemetry Client
            if (queryResults && context.turnState.has(telemetryLoggerMiddleware_1.TelemetryLoggerMiddleware.appInsightsServiceKey)) {
                const telemetryClient = context.turnState.get(telemetryLoggerMiddleware_1.TelemetryLoggerMiddleware.appInsightsServiceKey);
                const properties = {};
                const metrics = {};
                properties[this.qnaTelemetryConstants.knowledgeBaseIdProperty] = this.qnaMakerEndpoint.knowledgeBaseId;
                const conversationId = context.activity.conversation.id;
                if (conversationId && conversationId.trim()) {
                    properties[this.qnaTelemetryConstants.conversationIdProperty] = conversationId;
                }
                // For some customers, logging original text name within Application Insights might be an issue
                const text = context.activity.text;
                if (this._logOriginalMessage && text && text.trim()) {
                    properties[this.qnaTelemetryConstants.originalQuestionProperty] = text;
                }
                // For some customers, logging user name within Application Insights might be an issue
                const name = context.activity.from.name;
                if (this._logUsername && name && name.trim()) {
                    properties[this.qnaTelemetryConstants.usernameProperty] = name;
                }
                // Fill in Qna Results (found or not)
                if (queryResults.length > 0) {
                    const queryResult = queryResults[0];
                    properties[this.qnaTelemetryConstants.questionProperty] = Array.of(queryResult.questions)
                        .join(',');
                    properties[this.qnaTelemetryConstants.answerProperty] = queryResult.answer;
                    metrics[this.qnaTelemetryConstants.scoreProperty] = queryResult.score;
                    properties[this.qnaTelemetryConstants.articleFoundProperty] = 'true';
                }
                else {
                    properties[this.qnaTelemetryConstants.questionProperty] = 'No Qna Question matched';
                    properties[this.qnaTelemetryConstants.answerProperty] = 'No Qna Question matched';
                    properties[this.qnaTelemetryConstants.articleFoundProperty] = 'true';
                }
                // Track the event
                telemetryClient.trackEvent({
                    measurements: metrics,
                    name: TelemetryQnAMaker.qnaMessageEvent,
                    properties
                });
            }
            return queryResults;
        });
    }
}
TelemetryQnAMaker.qnaMessageEvent = 'QnaMessage';
exports.TelemetryQnAMaker = TelemetryQnAMaker;
//# sourceMappingURL=telemetryQnAMaker.js.map