import { TelemetryClient } from 'applicationinsights';
import { CosmosDbStorage } from 'botbuilder-azure';
import { IAppInsightsService } from 'botframework-config';
import { config } from 'dotenv';
import * as path from 'path';
import * as restify from 'restify';
import { TelemetryLoggerMiddleware } from './middleware/telemetry/TelemetryLoggerMiddleware';

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } from 'botbuilder';

import { QnAMaker } from 'botbuilder-ai';
import { DialogBot } from './bots/dialogBot';
import { MainDialog } from './dialogs/mainDialog';

// Note: Ensure you have a .env file and include LuisAppId, LuisAPIKey and LuisAPIHostName.
const ENV_FILE = path.join(__dirname, '..', '.env');
const loadFromEnv = config({ path: ENV_FILE });

const APPINSIGHTS_CONFIG: IAppInsightsService = { instrumentationKey: process.env.instrumentationKey } as IAppInsightsService;
const TELEMETRY_CLIENT: TelemetryClient = new TelemetryClient(APPINSIGHTS_CONFIG.instrumentationKey);
const MAIN_DIALOG = 'mainDialog';

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppID,
    appPassword: process.env.MicrosoftAppPassword,
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.delete(context);
};

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.
let conversationState: ConversationState;
let userState: UserState;

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
// const memoryStorage = new MemoryStorage();
const memoryStorage = new CosmosDbStorage({
    authKey: process.env.AUTH_KEY as string,
    collectionId: process.env.COLLECTION as string,
    databaseId: process.env.DATABASE as string,
    serviceEndpoint: process.env.DB_SERVICE_ENDPOINT as string,
});

const feedbackStorage = new CosmosDbStorage({
    authKey: process.env.AUTH_KEY as string,
    collectionId: 'feedback',
    databaseId: process.env.DATABASE as string,
    serviceEndpoint: process.env.DB_SERVICE_ENDPOINT as string,
});

conversationState = new ConversationState(memoryStorage);
userState = new UserState(memoryStorage);

// Pass in a logger to the bot. For this sample, the logger is the console, but alternatives such as Application Insights and Event Hub exist for storing the logs of the bot.
const logger = console;

const qnaMakerEndpoint = {
    endpointKey: process.env.endpointKey as string,
    host: process.env.hostname as string,
    knowledgeBaseId: process.env.kbId as string,
};

// Create the main dialog.
const dialog = new MainDialog(logger, qnaMakerEndpoint, conversationState, userState, feedbackStorage);
const bot = new DialogBot(conversationState, userState, dialog, logger);

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nSee https://aka.ms/connect-to-bot for more information`);
});

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});
