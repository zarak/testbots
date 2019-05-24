import { StatePropertyAccessor } from 'botbuilder';
import { CosmosDbStorage } from 'botbuilder-azure';
import { WaterfallDialog } from 'botbuilder-dialogs';
import { CancelAndHelpDialog } from './cancelAndHelpDialog';
export declare class FeedbackDialog extends CancelAndHelpDialog {
    feedbackPropertyAccessor: StatePropertyAccessor;
    private storage;
    feedbackHelperDialog: WaterfallDialog;
    constructor(id: string, feedbackPropertyAccessor: StatePropertyAccessor, storage: CosmosDbStorage);
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    private getFeedbackBool;
    private getFeedbackComment;
    private acknowledgeStep;
}
