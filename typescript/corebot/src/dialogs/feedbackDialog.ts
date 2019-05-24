import {
    CardFactory,
    StatePropertyAccessor,
    UserState,
} from 'botbuilder';
import { CosmosDbStorage } from 'botbuilder-azure';
import {
    ConfirmPrompt,
    DialogSet,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext,
} from 'botbuilder-dialogs';
import { CancelAndHelpDialog } from './cancelAndHelpDialog';

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT =  'textPrompt';
const USER_STATE_PROPERTY = 'userStateProperty';

interface FeedbackInfo {
    botResponse: string;
    conversationId: string;
    currentQuery: string;
    calledTrain: boolean;
    source: string | undefined;
}

interface UserFeedbackInfo {
    type: string;
    query: string | undefined;
    botResponse: string | undefined;
    conversationId: string | undefined;
    helpful: boolean;
    comment: string | undefined;
}

export class FeedbackDialog extends CancelAndHelpDialog {
    public feedbackHelperDialogName: string;
    // private feedbackPropertyAccessor: StatePropertyAccessor;
    public feedbackHelperDialog: WaterfallDialog;
    public feedbackPropertyAccessor: StatePropertyAccessor;

    constructor(id: string, public userState: UserState, private storage: CosmosDbStorage) {
        super(id || 'feedbackDialog');
        this.feedbackHelperDialogName = 'feedbackDialog';
        // this.qnaData = "value-qnaData";
        // this.currentQuery = "value-current-query";

        this.feedbackPropertyAccessor = this.userState.createProperty(USER_STATE_PROPERTY);

        this.feedbackHelperDialog = new WaterfallDialog(this.feedbackHelperDialogName);
        this.feedbackHelperDialog
            .addStep(this.getFeedbackBool.bind(this))
            .addStep(this.getFeedbackComment.bind(this))
            .addStep(this.acknowledgeStep.bind(this));

        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(this.feedbackHelperDialog);
    }

    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    private async getFeedbackBool(stepContext: WaterfallStepContext) {
        const feedbackInfo: Partial<FeedbackInfo> = stepContext.options;
        // console.log(`\n\n\n OPTIONS: `, feedbackInfo);

        const userInfo: UserFeedbackInfo = {
            botResponse: feedbackInfo.botResponse,
            comment: '',
            conversationId: feedbackInfo.conversationId,
            helpful: false,
            query: feedbackInfo.currentQuery,
            type: 'feedback',
        };

        await this.feedbackPropertyAccessor.set(stepContext.context, userInfo);
        // console.log("\n\n\nUSER INFO: ", await this.feedbackPropertyAccessor.get(stepContext.context));
        return await stepContext.prompt(CONFIRM_PROMPT, `Did you find this answer helpful?`);
    }

    private async getFeedbackComment(stepContext: WaterfallStepContext) {
        const userInfo: UserFeedbackInfo = await this.feedbackPropertyAccessor.get(stepContext.context);
        userInfo.helpful = stepContext.result;
        await this.feedbackPropertyAccessor.set(stepContext.context, userInfo);
        return await stepContext.prompt(TEXT_PROMPT, `Please leave any additional comments`);
    }

    private async acknowledgeStep(stepContext: WaterfallStepContext) {
        await stepContext.context.sendActivity(`Thanks!`);
        const userInfo: UserFeedbackInfo = await this.feedbackPropertyAccessor.get(stepContext.context);
        userInfo.comment = stepContext.result;
        await this.feedbackPropertyAccessor.set(stepContext.context, userInfo);

        // console.log('\n\n\nUSER INFO: ', userInfo);

        if (userInfo && userInfo.conversationId) {
            const changes: any = {};

            // Create unique ID to store under
            const time = stepContext.context.activity.timestamp ? stepContext.context.activity.timestamp : '';
            const unixSeconds = ((new Date(time)).getTime()) / 1000;
            const key: string = userInfo.conversationId + unixSeconds;

            changes[key] = userInfo;
            try {
                await this.storage.write(changes);
                console.log(`Writing to cosmos ${JSON.stringify(changes)}`);
            } catch (err) {
                console.error(`Could not write to Cosmos ${err}`);
            }
        }

        return stepContext.endDialog();
    }
}
