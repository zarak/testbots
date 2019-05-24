import { StatePropertyAccessor } from 'botbuilder';
import { DialogTurnResult, WaterfallStepContext } from 'botbuilder-dialogs';
import { QnAMaker, QnAMakerEndpoint } from 'botbuilder-ai';
import { ActiveLearningHelper } from '../helpers/activeLearningHelper';
import { CancelAndHelpDialog } from './cancelAndHelpDialog';
export declare class ClusteringDialog extends CancelAndHelpDialog {
    endpoint: QnAMakerEndpoint;
    qnaPropertyAccessor: StatePropertyAccessor;
    /**
     * QnAMaker Active Learning Dialog helper class.
     * @param {QnAMakerEndpoint} endpoint An instance of QnAMaker Endpoint.
     */
    qnaMaker: QnAMaker;
    activeLearningHelper: ActiveLearningHelper;
    constructor(id: string, endpoint: QnAMakerEndpoint, qnaPropertyAccessor: StatePropertyAccessor);
    callGenerateAnswer(stepContext: WaterfallStepContext): Promise<DialogTurnResult<any>>;
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    filterLowVariationScoreList(stepContext: WaterfallStepContext): Promise<DialogTurnResult>;
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    private callTrain;
    /**
     * @param {WaterfallStepContext} stepContext contextual information for the current step being executed.
     */
    private displayQnAResult;
}
