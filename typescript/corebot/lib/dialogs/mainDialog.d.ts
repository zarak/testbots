import { ConversationState, StatePropertyAccessor, TurnContext, UserState } from 'botbuilder';
import { QnAMakerEndpoint } from 'botbuilder-ai';
import { CosmosDbStorage } from 'botbuilder-azure';
import { ComponentDialog, DialogState } from 'botbuilder-dialogs';
import { Logger } from '../logger';
export declare class MainDialog extends ComponentDialog {
    private logger;
    private qnaPropertyAccessor;
    constructor(logger: Logger, endpoint: QnAMakerEndpoint, conversationState: ConversationState, userState: UserState, storage: CosmosDbStorage);
    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {TurnContext} context
     */
    run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>): Promise<void>;
    /**
     * Second step in the waterall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    private clusteringStep;
    private feedbackStep;
}
