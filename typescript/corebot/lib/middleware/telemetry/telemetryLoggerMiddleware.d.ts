import { TelemetryClient } from 'applicationinsights';
import { Middleware, TurnContext } from 'botbuilder';
/**
 * Middleware for logging incoming, outgoing, updated or deleted Activity messages into Application Insights.
 * In addition, registers the telemetry client in the context so other Application Insights
 * components can log telemetry.
 * If this Middleware is removed, all the other sample components don't log (but still operate).
 */
export declare class TelemetryLoggerMiddleware implements Middleware {
    static readonly appInsightsServiceKey: string;
    /**
     * Application Insights Custom Event name, logged when new message is received from the user
     */
    static readonly botMsgReceiveEvent: string;
    /**
     * Application Insights Custom Event name, logged when a message is sent out from the bot
     */
    static readonly botMsgSendEvent: string;
    /**
     * Application Insights Custom Event name, logged when a message is updated by the bot (rare case)
     */
    static readonly botMsgUpdateEvent: string;
    /**
     * Application Insights Custom Event name, logged when a message is deleted by the bot (rare case)
     */
    static readonly botMsgDeleteEvent: string;
    private readonly telemetryClient;
    private readonly telemetryConstants;
    private readonly _logUsername;
    private readonly _logOriginalMessage;
    /**
     * Initializes a new instance of the TelemetryLoggerMiddleware class.
     * @param instrumentationKey The Application Insights instrumentation key.  See Application Insights for more information.
     * @param logUsername (Optional) Enable/Disable logging user name within Application Insights.
     * @param logOriginalMessage (Optional) Enable/Disable logging original message name within Application Insights.
     */
    constructor(telemetryClient: TelemetryClient, logUsername?: boolean, logOriginalMessage?: boolean);
    /**
     * Gets a value indicating whether indicates whether to log the original message into the BotMessageReceived event.
     */
    readonly logUsername: boolean;
    /**
     * Gets a value indicating whether indicates whether to log the user name into the BotMessageReceived event.
     */
    readonly logOriginalMessage: boolean;
    /**
     * Records incoming and outgoing activities to the Application Insights store.
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline
     */
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    /**
     * Fills the Application Insights Custom Event properties for BotMessageReceived.
     * These properties are logged in the custom event when a new message is received from the user.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageReceived Message.
     */
    private fillReceiveEventProperties;
    /**
     * Fills the Application Insights Custom Event properties for BotMessageSend.
     * These properties are logged in the custom event when a response message is sent by the Bot to the user.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageSend Message.
     */
    private fillSendEventProperties;
    /**
     * Fills the Application Insights Custom Event properties for BotMessageUpdate.
     * These properties are logged in the custom event when an activity message is updated by the Bot.
     * For example, if a card is interacted with by the use, and the card needs to be updated to reflect
     * some interaction.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageUpdate Message.
     */
    private fillUpdateEventProperties;
    /**
     * Fills the Application Insights Custom Event properties for BotMessageDelete.
     * These properties are logged in the custom event when an activity message is deleted by the Bot.  This is a relatively rare case.
     * @param activity - Last activity sent from user.
     * @returns A dictionary that is sent as "Properties" to Application Insights TrackEvent method for the BotMessageDelete Message.
     */
    private fillDeleteEventProperties;
}
