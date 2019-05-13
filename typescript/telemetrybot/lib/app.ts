import { TurnContext, UserState, BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder';
import { IAppInsightsService } from 'botframework-config';
import { TelemetryClient } from 'applicationinsights';
import * as restify from 'restify';
import { ComplexBot } from './bot';
import { TelemetryLoggerMiddleware } from '../telemetry/TelemetryLoggerMiddleware';

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`Listening on ${server.url}`);
});

const APPINSIGHTS_CONFIG: IAppInsightsService = <IAppInsightsService> { instrumentationKey: '994d6ecc-887c-47b8-9bdd-5635b47b6ff8' };
const TELEMETRY_CLIENT: TelemetryClient = new TelemetryClient(APPINSIGHTS_CONFIG.instrumentationKey);

const ADAPTER = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

ADAPTER.onTurnError = async (turnContext: TurnContext, error: Error): Promise<void> => {
    const appInsightsLogger: TelemetryLoggerMiddleware = new TelemetryLoggerMiddleware(TELEMETRY_CLIENT, true,  true);
    ADAPTER.use(appInsightsLogger);

    // CAUTION:  The sample simply logs the error to the console.
    // tslint:disable-next-line:no-console
    console.error(error);
    // For production bots, use AppInsights or similar telemetry system.
    // tell the user something happen
    TELEMETRY_CLIENT.trackException({ exception: error });
    // for multi-turn dialog interactions,
    // make sure we clear the conversation state
    await turnContext.sendActivity('Sorry, it looks like something went wrong.');
};

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const bot = new ComplexBot(conversationState, userState);

server.post("/api/messages", (req, res) => {
    ADAPTER.processActivity(req, res, async (context) => {
        await bot.onTurn(context);
    });
});
