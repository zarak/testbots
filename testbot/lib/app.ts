import { BotFrameworkAdapter, ConversationState, MemoryStorage } from 'botbuilder';
import { QnAMaker, LuisRecognizer } from 'botbuilder-ai';
import { DialogSet } from 'botbuilder-dialogs';
import { IQnAService, ILuisService, BotConfiguration } from 'botframework-config';
import * as restify from 'restify';
import { ConfBot } from './bot';
import { config } from 'dotenv';

// Create env variables into process.env
config();

// Load synchronously
const botConfig = BotConfiguration.loadSync("./conf-edui2018.bot", process.env.BOT_FILE_SECRET);

const conversationState = new ConversationState(new MemoryStorage);
const dialogs = new DialogSet(conversationState.createProperty("dialogState"));

const server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`${server.name} listening on ${server.url}`);
});

const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


const qnaMaker = new QnAMaker({
    knowledgeBaseId: (<IQnAService>botConfig.findServiceByNameOrId("192")).kbId,
    endpointKey: (<IQnAService>botConfig.findServiceByNameOrId("192")).endpointKey,
    host: (<IQnAService>botConfig.findServiceByNameOrId("192")).hostname,
});

const luis = new LuisRecognizer({
    applicationId: (<ILuisService>botConfig.findServiceByNameOrId("100")).appId,
    endpointKey: (<ILuisService>botConfig.findServiceByNameOrId("100")).authoringKey,
    endpoint: (<ILuisService>botConfig.findServiceByNameOrId("100")).getEndpoint(),
});

const bot = new ConfBot(
    qnaMaker,
    luis,
    dialogs,
    conversationState
);

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.onTurn(context);
    });
});
