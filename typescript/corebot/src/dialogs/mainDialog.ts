import { ClusteringDialog } from './clusteringDialog';

import { ConversationState, StatePropertyAccessor, TurnContext } from 'botbuilder';

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

import { QnAMakerEndpoint } from 'botbuilder-ai';
import { Logger } from '../logger';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const CLUSTERING_DIALOG = 'clusteringDialog';

export class MainDialog extends ComponentDialog {
    private qnaPropertyAccessor: StatePropertyAccessor;
    constructor(private logger: Logger, endpoint: QnAMakerEndpoint, conversationState: ConversationState) {
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
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.actStep.bind(this),
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
    private async actStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // In this sample we only have a single intent we are concerned with. However, typically a scenario
        // will have multiple different intents each corresponding to starting a different child dialog.
        return await stepContext.beginDialog('clusteringDialog');
    }
}
