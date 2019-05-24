import { CardFactory, ConversationState, MemoryStorage, StatePropertyAccessor } from 'botbuilder';
import { DialogTurnResult, DialogTurnStatus, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { TelemetryQnAMaker } from '../middleware/telemetry/telemetryQnAMaker';

import {
    QnAMaker,
    QnAMakerEndpoint,
    QnAMakerOptions,
    QnAMakerResult,
} from 'botbuilder-ai';
import { ActiveLearningHelper } from '../helpers/activeLearningHelper';
import { CancelAndHelpDialog } from './cancelAndHelpDialog';

const CONVERSATION_STATE_PROPERTY = 'conversationStateProperty';
const USER_STATE_PROPERTY = 'userStateProperty';
const WATERFALL_DIALOG = 'waterfallDialog';

interface FeedbackInfo {
    botResponse: string;
    conversationId: string;
    currentQuery: string;
    calledTrain: boolean;
    source: string | undefined;
}

interface QnAProperty {
    qnaData: QnAMakerResult[];
    activeLearningDialogName: string;
    currentQuery: string;
    source: string | undefined;
    calledTrain: boolean;
}

interface FeedbackRecords {
    FeedbackRecords: [
        {
            UserId?: string,
            UserQuestion?: string,
            QnaId?: number,
        }
    ];
}

export class ClusteringDialog extends CancelAndHelpDialog {
    /**
     * QnAMaker Active Learning Dialog helper class.
     * @param {QnAMakerEndpoint} endpoint An instance of QnAMaker Endpoint.
     */
    public qnaMaker: QnAMaker;
    public activeLearningHelper: ActiveLearningHelper;
    // private qnaPropertyAccessor: StatePropertyAccessor;

    constructor(id: string, public endpoint: QnAMakerEndpoint, public qnaPropertyAccessor: StatePropertyAccessor) {
        super(id || 'clusteringDialog');

        this.initialDialogId = WATERFALL_DIALOG;

        // this.qnaPropertyAccessor = this.conversationState.createProperty(CONVERSATION_STATE_PROPERTY);

        this.qnaMaker = new QnAMaker(endpoint);
        this.activeLearningHelper = new ActiveLearningHelper();
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            (this.callGenerateAnswer.bind(this)),
            (this.filterLowVariationScoreList.bind(this)),
            (this.callTrain.bind(this)),
            (this.displayQnAResult.bind(this)),
        ]));
    }

    public async callGenerateAnswer(stepContext: WaterfallStepContext) {
        // Default QnAMakerOptions
        const qnaMakerOptions: QnAMakerOptions = {
            scoreThreshold: 0.03,
            top: 3,
        };

        // if (stepContext.activeDialog && stepContext.activeDialog.state.options !== null) {
            // console.log(stepContext.activeDialog.state);
            // qnaMakerOptions = stepContext.activeDialog.state.options;
        // }

        // Perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
        const telResults: any = new TelemetryQnAMaker(this.endpoint, qnaMakerOptions, true, true);
        let qnaResults: QnAMakerResult[];
        qnaResults = await telResults.getAnswersAsync(stepContext.context);

        const filteredResponses: QnAMakerResult[] = qnaResults.filter(
            (r) => qnaMakerOptions.scoreThreshold ? r.score > qnaMakerOptions.scoreThreshold : false,
        );

        const qnaPropertyData: QnAProperty = {
            activeLearningDialogName: this.id,
            calledTrain: false,
            currentQuery: stepContext.context.activity.text,
            qnaData: filteredResponses,
            source: (qnaResults && qnaResults.length >= 1) ? qnaResults[0].source : '',
        };
        await this.qnaPropertyAccessor.set(stepContext.context, qnaPropertyData);

        return await stepContext.next();
    }
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    public async filterLowVariationScoreList(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {

        const qnaPropertyData: QnAProperty = await this.qnaPropertyAccessor.get(stepContext.context);
        const responses: QnAMakerResult[] = qnaPropertyData.qnaData;
        // console.log('\n\n\nQnAPROPERTYDATA2', qnaPropertyData);

        if (qnaPropertyData.source === 'qna_chitchat_witty.tsv') {
            return await stepContext.next(responses);
        }

        const filteredResponses: QnAMakerResult[] = this.activeLearningHelper.getLowScoreVariation(responses);

        qnaPropertyData.qnaData = filteredResponses;
        await this.qnaPropertyAccessor.set(stepContext.context, qnaPropertyData);

        if (filteredResponses.length > 1) {
            const suggestedQuestions: string[] = [];
            filteredResponses.forEach( (element) => {
                suggestedQuestions.push(element.questions == null ? '' : element.questions[0]);
            });
            const message = GetHeroCard(suggestedQuestions);

            await stepContext.context.sendActivity(message);

            return { status: DialogTurnStatus.waiting };
        } else {
            return await stepContext.next(responses);
        }
    }
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    private async callTrain(stepContext: WaterfallStepContext) {
        const qnaPropertyData = await this.qnaPropertyAccessor.get(stepContext.context);
        const trainResponses: QnAMakerResult[] = qnaPropertyData.qnaData;
        if (qnaPropertyData.source === 'qna_chitchat_witty.tsv') {
            return await stepContext.next(trainResponses);
        }

        const currentQuery = qnaPropertyData.currentQuery;

        if (trainResponses.length > 1) {
            const reply = stepContext.context.activity.text;
            const qnaResults = trainResponses.filter(
                (r) => r.questions ? r.questions[0] === reply : false,
            );

            if (qnaResults.length > 0) {

                qnaPropertyData.qnaData = qnaResults;
                qnaPropertyData.calledTrain = true;
                await this.qnaPropertyAccessor.set(stepContext.context, qnaPropertyData);

                const feedbackRecords: FeedbackRecords = {
                    FeedbackRecords: [
                        {
                            QnaId: qnaResults[0].id,
                            UserId: stepContext.context.activity.id,
                            UserQuestion: currentQuery,
                        },
                    ],
                };
                // Call Active Learning Train API
                this.activeLearningHelper.callTrain(
                    this.endpoint.host, feedbackRecords, this.endpoint.knowledgeBaseId, this.endpoint.endpointKey);
                return await stepContext.next(qnaResults);
            } else {
                return await stepContext.endDialog();
            }
        }

        return await stepContext.next(stepContext.result);
    }
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    private async displayQnAResult(stepContext: WaterfallStepContext) {
        const qnaPropertyData: QnAProperty = await this.qnaPropertyAccessor.get(stepContext.context);
        const responses: QnAMakerResult[] = stepContext.result;

        let message = 'No QnAMaker answers found.';
        if (responses != null) {
            const answers: string[] = responses.map( (qnaRes: QnAMakerResult ) => qnaRes.answer );
            if (answers.length > 0) {
                    message = responses[0].answer;
            }
        }
        await stepContext.context.sendActivity(message);
        // console.log('\n\n\nSTEPCONTEXT: ', (stepContext));

        const feedbackInfo: FeedbackInfo = {
            botResponse: message,
            calledTrain: qnaPropertyData.calledTrain,
            conversationId: stepContext.context.activity.conversation.id,
            currentQuery: qnaPropertyData.currentQuery,
            source: qnaPropertyData.source,
        };
        // console.log('\n\n\nFEEDBACK INFO: ', feedbackInfo);
        return await stepContext.endDialog(feedbackInfo);
    }
}

/**
 * Get Hero card to get user feedback
 * @param {Array} suggestionList A list of suggested questions strings.
 * @param {string} cardTitle Title of the card.
 * @param {string} cardNoMatchText No match text.
 */
function GetHeroCard(suggestionList: string[], cardTitle = 'Did you mean:', cardNoMatchText = 'None of the above.') {

    const cardActions = [];
    suggestionList.forEach( ( element ) => {
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
    const heroCard = CardFactory.heroCard(
        cardTitle,
        [],
        CardFactory.actions(cardActions));
    return  { attachments: [heroCard] };
}
