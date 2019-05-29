import { QnAMakerResult } from 'botbuilder-ai';

export interface FeedbackInfo {
    botResponse: string;
    conversationId: string;
    currentQuery: string;
    calledTrain: boolean;
    source: string | undefined;
}

export interface QnAProperty {
    qnaData: QnAMakerResult[];
    activeLearningDialogName: string;
    currentQuery: string;
    source: string | undefined;
    calledTrain: boolean;
}

export interface FeedbackRecords {
    FeedbackRecords: [
        {
            UserId?: string,
            UserQuestion?: string,
            QnaId?: number,
        }
    ];
}

export interface UserFeedbackInfo {
    type: string;
    query: string | undefined;
    botResponse: string | undefined;
    conversationId: string | undefined;
    helpful: boolean;
    comment: string | undefined;
}
