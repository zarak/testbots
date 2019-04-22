import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder';
import * as restify from 'restify';
import { InterruptBot } from './bot';
import { QnAMaker } from 'botbuilder-ai';
import { DialogSet } from 'botbuilder-dialogs';
import { IQnAService } from 'botframework-config';
import { config } from 'dotenv';

// Create env variables into process.env
config();

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`Listening on ${server.url}`);
});

const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const qnaMaker = new QnAMaker({
    knowledgeBaseId: <string>process.env.kbId,
    endpointKey: <string>process.env.endpointKey,
    host: <string>process.env.hostname,
});

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

const bot = new InterruptBot(conversationState, qnaMaker);

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.onTurn(context);
    });
});
