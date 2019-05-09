import { UserState, BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder';
import * as restify from 'restify';
import { config } from 'dotenv';

import { AuthBot } from './bots/authBot';
import { MainDialog } from './dialogs/mainDialog';

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

const dialog = new MainDialog();
const bot = new AuthBot(conversationState, userState, dialog);

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context, );
    });
});
