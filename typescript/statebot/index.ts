import { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState, TurnContext } from 'botbuilder';
import * as restify from 'restify';
import { StateBot2 } from './bot';

// State Accessor Properties

const DEV_ENVIRONMENT = 'development';

const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);

const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword
});

adapter.onTurnError = async (context, error) => {
    console.error(error);
    await context.sendActivity('Oops. Something went wrong');
    await conversationState.delete(context);
}

let conversationState : ConversationState;

const memoryStorage = new MemoryStorage();
conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);


const myBot = new StateBot2(conversationState, userState);

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`Listening on ${server.url}`);
});

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await myBot.onTurn(context);
    });
});
