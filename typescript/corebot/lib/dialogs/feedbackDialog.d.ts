import { StatePropertyAccessor, UserState } from 'botbuilder';
import { CosmosDbStorage } from 'botbuilder-azure';
import { WaterfallDialog } from 'botbuilder-dialogs';
import { CancelAndHelpDialog } from './cancelAndHelpDialog';
export declare class FeedbackDialog extends CancelAndHelpDialog {
    userState: UserState;
    private storage;
    feedbackHelperDialogName: string;
    feedbackHelperDialog: WaterfallDialog;
    feedbackPropertyAccessor: StatePropertyAccessor;
    constructor(id: string, userState: UserState, storage: CosmosDbStorage);
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    private getFeedbackBool;
    private getFeedbackComment;
    private acknowledgeStep;
}
