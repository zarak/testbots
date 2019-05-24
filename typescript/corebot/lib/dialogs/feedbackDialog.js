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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const cancelAndHelpDialog_1 = require("./cancelAndHelpDialog");
const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const USER_STATE_PROPERTY = 'userStateProperty';
const WATERFALL_DIALOG = 'waterfallDialog';
class FeedbackDialog extends cancelAndHelpDialog_1.CancelAndHelpDialog {
    // public feedbackPropertyAccessor: StatePropertyAccessor;
    constructor(id, feedbackPropertyAccessor, storage) {
        super(id || 'feedbackDialog');
        this.feedbackPropertyAccessor = feedbackPropertyAccessor;
        this.storage = storage;
        this.initialDialogId = WATERFALL_DIALOG;
        // this.qnaData = "value-qnaData";
        // this.currentQuery = "value-current-query";
        // this.feedbackPropertyAccessor = this.userState.createProperty(USER_STATE_PROPERTY);
        this.feedbackHelperDialog = new botbuilder_dialogs_1.WaterfallDialog(WATERFALL_DIALOG);
        this.feedbackHelperDialog
            .addStep(this.getFeedbackBool.bind(this))
            .addStep(this.getFeedbackComment.bind(this))
            .addStep(this.acknowledgeStep.bind(this));
        this.addDialog(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(this.feedbackHelperDialog);
    }
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    getFeedbackBool(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const feedbackInfo = stepContext.options;
            // console.log(`\n\n\n OPTIONS: `, feedbackInfo);
            const userInfo = {
                botResponse: feedbackInfo.botResponse,
                comment: '',
                conversationId: feedbackInfo.conversationId,
                helpful: false,
                query: feedbackInfo.currentQuery,
                type: 'feedback',
            };
            yield this.feedbackPropertyAccessor.set(stepContext.context, userInfo);
            // console.log("\n\n\nUSER INFO: ", await this.feedbackPropertyAccessor.get(stepContext.context));
            return yield stepContext.prompt(CONFIRM_PROMPT, `Did you find this answer helpful?`);
        });
    }
    getFeedbackComment(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const userInfo = yield this.feedbackPropertyAccessor.get(stepContext.context);
            console.log('userinfo', userInfo);
            userInfo.helpful = stepContext.result;
            yield this.feedbackPropertyAccessor.set(stepContext.context, userInfo);
            return yield stepContext.prompt(TEXT_PROMPT, `Please leave any additional comments`);
        });
    }
    acknowledgeStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield stepContext.context.sendActivity(`Thanks!`);
            const userInfo = yield this.feedbackPropertyAccessor.get(stepContext.context);
            userInfo.comment = stepContext.result;
            yield this.feedbackPropertyAccessor.set(stepContext.context, userInfo);
            console.log('\n\n\nUSER INFO: ', userInfo);
            if (userInfo && userInfo.conversationId) {
                const changes = {};
                // Create unique ID to store under
                const time = stepContext.context.activity.timestamp ? stepContext.context.activity.timestamp : '';
                const unixSeconds = ((new Date(time)).getTime()) / 1000;
                const key = userInfo.conversationId + unixSeconds;
                changes[key] = userInfo;
                try {
                    yield this.storage.write(changes);
                    console.log(`Writing to cosmos ${JSON.stringify(changes)}`);
                }
                catch (err) {
                    console.error(`Could not write to Cosmos ${err}`);
                }
            }
            return stepContext.endDialog();
        });
    }
}
exports.FeedbackDialog = FeedbackDialog;
//# sourceMappingURL=feedbackDialog.js.map