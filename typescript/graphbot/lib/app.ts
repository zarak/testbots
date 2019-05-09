import { UserState, BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder';
import * as restify from 'restify';
import { AuthBot } from './bot';
import { config } from 'dotenv';

config();

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`Listening on ${server.url}`);
});


const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
});

console.log(adapter);

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const bot = new AuthBot(conversationState, userState);

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.onTurn(context);
    });
});
