import { TurnContext } from 'botbuilder';
import { QnAMaker, QnAMakerEndpoint, QnAMakerOptions, QnAMakerResult } from 'botbuilder-ai';
/**
 * TelemetryQnaRecognizer invokes the Qna Maker and logs some results into Application Insights.
 * Logs the score, and (optionally) questionAlong with Conversation and ActivityID.
 * The Custom Event name this logs is "QnaMessage"
 */
export declare class TelemetryQnAMaker extends QnAMaker {
    static readonly qnaMessageEvent: string;
    private readonly _logOriginalMessage;
    private readonly _logUsername;
    private qnaOptions;
    private qnaMakerEndpoint;
    private qnaTelemetryConstants;
    /**
     * Initializes a new instance of the TelemetryQnAMaker class.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param qnaOptions The options for the QnA Maker knowledge base.
     * @param logUsername The flag to include username in logs.
     * @param logOriginalMessage The flag to include original message in logs.
     */
    constructor(endpoint: QnAMakerEndpoint, qnaOptions?: QnAMakerOptions, logUsername?: boolean, logOriginalMessage?: boolean);
    /**
     * Gets a value indicating whether determines whether to log the User name.
     */
    readonly logUsername: boolean;
    /**
     * Gets a value indicating whether determines whether to log the Activity message text that came from the user.
     */
    readonly logOriginalMessage: boolean;
    getAnswersAsync(context: TurnContext): Promise<QnAMakerResult[]>;
}
