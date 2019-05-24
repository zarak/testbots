import { QnAMakerResult } from 'botbuilder-ai';
interface FeedbackRecords {
    FeedbackRecords: [{
        UserId?: string;
        UserQuestion?: string;
        QnaId?: number;
    }];
}
export declare class ActiveLearningHelper {
    /**
     * Returns list of qnaSearch results which have low score variation.
     * @param {QnAMakerResult[]} qnaSearchResults A list of results returned from the QnA getAnswer call.
     */
    getLowScoreVariation(qnaSearchResults: QnAMakerResult[]): QnAMakerResult[];
    includeForClustering(prevScore: number, currentScore: number, multiplier: number): boolean;
    /**
     * Method to call QnAMaker Train API for Active Learning
     * @param {string} host Endpoint host of the runtime
     * @param {FeedbackRecords[]} feedbackRecords Body of the train API
     * @param {string} kbId Knowledgebase Id
     * @param {string} key Endpoint key
     */
    callTrain(host: string, feedbackRecords: FeedbackRecords, kbId: string, key: string): Promise<void>;
}
export {};
