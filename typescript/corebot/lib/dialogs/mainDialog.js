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
const clusteringDialog_1 = require("./clusteringDialog");
const feedbackDialog_1 = require("./feedbackDialog");
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const CLUSTERING_DIALOG = 'clusteringDialog';
const FEEDBACK_DIALOG = 'feedbackDialog';
class MainDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(logger, endpoint, conversationState, userState, storage) {
        super('MainDialog');
        this.logger = logger;
        this.endpoint = endpoint;
        this.conversationState = conversationState;
        this.userState = userState;
        this.storage = storage;
        if (!logger) {
            logger = console;
            logger.log('[MainDialog]: logger not passed in, defaulting to console');
        }
        this.qnaPropertyAccessor = conversationState.createProperty('qna');
        this.feedbackPropertyAccessor = conversationState.createProperty('feedback');
        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new botbuilder_dialogs_1.TextPrompt('TextPrompt'))
            .addDialog(new clusteringDialog_1.ClusteringDialog(CLUSTERING_DIALOG, endpoint, this.qnaPropertyAccessor))
            .addDialog(new feedbackDialog_1.FeedbackDialog(FEEDBACK_DIALOG, this.feedbackPropertyAccessor, storage))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(MAIN_WATERFALL_DIALOG, [
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
    run(context, accessor) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
            dialogSet.add(this);
            const dialogContext = yield dialogSet.createContext(context);
            const results = yield dialogContext.continueDialog();
            if (results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
                yield dialogContext.beginDialog(this.id);
            }
        });
    }
    /**
     * Second step in the waterall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    clusteringStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            // In this sample we only have a single intent we are concerned with. However, typically a scenario
            // will have multiple different intents each corresponding to starting a different child dialog.
            return yield stepContext.beginDialog('clusteringDialog');
        });
    }
    feedbackStep(stepContext) {
        return __awaiter(this, void 0, void 0, function* () {
            // if (stepContext.)
            console.log('FEEDBACKSTEP CONTEXT RESULT', stepContext.result);
            // In this sample we only have a single intent we are concerned with. However, typically a scenario
            // will have multiple different intents each corresponding to starting a different child dialog.
            if (stepContext.result &&
                !stepContext.result.calledTrain &&
                stepContext.result.source === 'AI chat bot QnA.docx') {
                const feedbackRes = yield stepContext.beginDialog('feedbackDialog', stepContext.result);
                return feedbackRes;
            }
            else {
                return yield stepContext.endDialog();
            }
        });
    }
}
exports.MainDialog = MainDialog;
//# sourceMappingURL=mainDialog.js.map