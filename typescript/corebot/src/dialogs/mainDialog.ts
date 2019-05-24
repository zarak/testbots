import { ConversationState, StatePropertyAccessor, TurnContext, UserState } from 'botbuilder';
import { QnAMakerEndpoint } from 'botbuilder-ai';
import { CosmosDbStorage } from 'botbuilder-azure';
import {
    ComponentDialog,
    DialogSet,
    DialogState,
    DialogTurnResult,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext,
} from 'botbuilder-dialogs';
import { Logger } from '../logger';
import { ClusteringDialog } from './clusteringDialog';
import { FeedbackDialog } from './feedbackDialog';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const CLUSTERING_DIALOG = 'clusteringDialog';
const FEEDBACK_DIALOG = 'feedbackDialog';

export class MainDialog extends ComponentDialog {
    private qnaPropertyAccessor: StatePropertyAccessor;
    constructor(
        private logger: Logger,
        endpoint: QnAMakerEndpoint,
        conversationState: ConversationState,
        userState: UserState,
        storage: CosmosDbStorage,
    ) {
        super('MainDialog');
        if (!logger) {
            logger = console as Logger;
            logger.log('[MainDialog]: logger not passed in, defaulting to console');
        }

        this.qnaPropertyAccessor = conversationState.createProperty('qna');

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new ClusteringDialog(CLUSTERING_DIALOG, endpoint, this.qnaPropertyAccessor))
            .addDialog(new FeedbackDialog(FEEDBACK_DIALOG, userState, storage))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.clusteringStep.bind(this),
                this.feedbackStep.bind(this),
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {TurnContext} context
     */
    public async run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * Second step in the waterall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    private async clusteringStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // In this sample we only have a single intent we are concerned with. However, typically a scenario
        // will have multiple different intents each corresponding to starting a different child dialog.
        return await stepContext.beginDialog('clusteringDialog');
    }

    private async feedbackStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // if (stepContext.)
        console.log('FEEDBACKSTEP CONTEXT RESULT', stepContext.result);
        // In this sample we only have a single intent we are concerned with. However, typically a scenario
        // will have multiple different intents each corresponding to starting a different child dialog.
        if ( stepContext.result &&
            !stepContext.result.calledTrain &&
             stepContext.result.source === 'AI chat bot QnA.docx'
        ) {
            const feedbackRes: DialogTurnResult =
                await stepContext.beginDialog('feedbackDialog', stepContext.result);
            return feedbackRes;
        } else {
            return await stepContext.endDialog();
        }
    }
}
