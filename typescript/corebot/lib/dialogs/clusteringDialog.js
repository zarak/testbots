"use strict";
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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const telemetryQnAMaker_1 = require("../middleware/telemetry/telemetryQnAMaker");
const botbuilder_ai_1 = require("botbuilder-ai");
const activeLearningHelper_1 = require("../helpers/activeLearningHelper");
const cancelAndHelpDialog_1 = require("./cancelAndHelpDialog");
const CONVERSATION_STATE_PROPERTY = 'conversationStateProperty';
const USER_STATE_PROPERTY = 'userStateProperty';
const WATERFALL_DIALOG = 'waterfallDialog';
class ClusteringDialog extends cancelAndHelpDialog_1.CancelAndHelpDialog {
    constructor(id, endpoint, conversationState) {
        super(id || 'activeLearningDialog');
        this.endpoint = endpoint;
        this.conversationState = conversationState;
        this.initialDialogId = WATERFALL_DIALOG;
        this.qnaPropertyAccessor = this.conversationState.createProperty(CONVERSATION_STATE_PROPERTY);
        this.qnaMaker = new botbuilder_ai_1.QnAMaker(endpoint);
        this.activeLearningHelper = new activeLearningHelper_1.ActiveLearningHelper();
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(WATERFALL_DIALOG, [
            (this.callGenerateAnswer.bind(this)),
            (this.filterLowVariationScoreList.bind(this)),
            (this.callTrain.bind(this)),
            (this.displayQnAResult.bind(this)),
        ]));
    }
    callGenerateAnswer(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            // Default QnAMakerOptions
            let qnaMakerOptions = {
                scoreThreshold: 0.03,
                top: 3,
            };
            if (stepContext.activeDialog && stepContext.activeDialog.state.options != null) {
                qnaMakerOptions = stepContext.activeDialog.state.options;
            }
            // Perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
            const telResults = new telemetryQnAMaker_1.TelemetryQnAMaker(this.endpoint, qnaMakerOptions, true, true);
            let qnaResults;
            qnaResults = yield telResults.getAnswersAsync(stepContext.context);
            const filteredResponses = qnaResults.filter((r) => qnaMakerOptions.scoreThreshold ? r.score > qnaMakerOptions.scoreThreshold : false);
            const qnaPropertyData = {
                activeLearningDialogName: this.id,
                calledTrain: false,
                currentQuery: stepContext.context.activity.text,
                qnaData: filteredResponses,
                source: (qnaResults && qnaResults.length >= 1) ? qnaResults[0].source : '',
            };
            yield this.qnaPropertyAccessor.set(stepContext.context, qnaPropertyData);
            return yield stepContext.next();
        });
    }
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    filterLowVariationScoreList(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const qnaPropertyData = yield this.qnaPropertyAccessor.get(stepContext.context);
            const responses = qnaPropertyData.qnaData;
            if (qnaPropertyData.source === 'qna_chitchat_witty.tsv') {
                return yield stepContext.next(responses);
            }
            const filteredResponses = this.activeLearningHelper.getLowScoreVariation(responses);
            console.log('\n\nFILTERED RESPONSES', filteredResponses);
            qnaPropertyData.qnaData = filteredResponses;
            yield this.qnaPropertyAccessor.set(stepContext.context, qnaPropertyData);
            if (filteredResponses.length > 1) {
                const suggestedQuestions = [];
                filteredResponses.forEach((element) => {
                    suggestedQuestions.push(element.questions == null ? '' : element.questions[0]);
                });
                const message = GetHeroCard(suggestedQuestions);
                yield stepContext.context.sendActivity(message);
                return { status: botbuilder_dialogs_1.DialogTurnStatus.waiting };
            }
            else {
                return yield stepContext.next(responses);
            }
        });
    }
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    callTrain(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const qnaPropertyData = yield this.qnaPropertyAccessor.get(stepContext.context);
            const trainResponses = qnaPropertyData.qnaData;
            if (qnaPropertyData.source === 'qna_chitchat_witty.tsv') {
                return yield stepContext.next(trainResponses);
            }
            const currentQuery = qnaPropertyData.currentQuery;
            if (trainResponses.length > 1) {
                const reply = stepContext.context.activity.text;
                const qnaResults = trainResponses.filter((r) => r.questions ? r.questions[0] === reply : false);
                if (qnaResults.length > 0) {
                    qnaPropertyData.qnaData = qnaResults;
                    qnaPropertyData.calledTrain = true;
                    yield this.qnaPropertyAccessor.set(stepContext.context, qnaPropertyData);
                    const feedbackRecords = {
                        FeedbackRecords: [
                            {
                                QnaId: qnaResults[0].id,
                                UserId: stepContext.context.activity.id,
                                UserQuestion: currentQuery,
                            },
                        ],
                    };
                    // Call Active Learning Train API
                    this.activeLearningHelper.callTrain(this.endpoint.host, feedbackRecords, this.endpoint.knowledgeBaseId, this.endpoint.endpointKey);
                    return yield stepContext.next(qnaResults);
                }
                else {
                    return yield stepContext.endDialog();
                }
            }
            return yield stepContext.next(stepContext.result);
        });
    }
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    displayQnAResult(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const qnaPropertyData = yield this.qnaPropertyAccessor.get(stepContext.context);
            const responses = stepContext.result;
            let message = 'No QnAMaker answers found.';
            if (responses != null) {
                const answers = responses.map((qnaRes) => qnaRes.answer);
                if (answers.length > 0) {
                    message = responses[0].answer;
                }
            }
            yield stepContext.context.sendActivity(message);
            console.log('\n\n\nSTEPCONTEXT: ', (stepContext));
            console.log('\n\n\\nRECIPIENT: ', JSON.stringify(stepContext.context.activity.recipient));
            const feedbackInfo = {
                botResponse: message,
                calledTrain: qnaPropertyData.calledTrain,
                conversationId: stepContext.context.activity.conversation.id,
                currentQuery: qnaPropertyData.currentQuery,
                source: qnaPropertyData.source,
            };
            console.log('\n\n\nFEEDBACK INFO: ', feedbackInfo);
            return yield stepContext.endDialog(feedbackInfo);
        });
    }
}
exports.ClusteringDialog = ClusteringDialog;
/**
 * Get Hero card to get user feedback
 * @param {Array} suggestionList A list of suggested questions strings.
 * @param {string} cardTitle Title of the card.
 * @param {string} cardNoMatchText No match text.
 */
function GetHeroCard(suggestionList, cardTitle = 'Did you mean:', cardNoMatchText = 'None of the above.') {
    const cardActions = [];
    suggestionList.forEach((element) => {
        cardActions.push({
            title: element,
            type: 'imBack',
            value: element,
        });
    });
    cardActions.push({
        title: cardNoMatchText,
        type: 'imBack',
        value: cardNoMatchText,
    });
    const heroCard = botbuilder_1.CardFactory.heroCard(cardTitle, [], botbuilder_1.CardFactory.actions(cardActions));
    return { attachments: [heroCard] };
}
//# sourceMappingURL=clusteringDialog.js.map