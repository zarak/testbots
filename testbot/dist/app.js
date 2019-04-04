"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_ai_1 = require("botbuilder-ai");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botframework_config_1 = require("botframework-config");
const restify = require("restify");
const bot_1 = require("./bot");
const dotenv_1 = require("dotenv");
dotenv_1.config();
const botConfig = botframework_config_1.BotConfiguration.loadSync("./conf-edui2018.bot", process.env.BOT_FILE_SECRET);
const conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage);
const dialogs = new botbuilder_dialogs_1.DialogSet(conversationState.createProperty("dialogState"));
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`${server.name} listening on ${server.url}`);
});
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
const qnaMaker = new botbuilder_ai_1.QnAMaker({
    knowledgeBaseId: botConfig.findServiceByNameOrId("192").kbId,
    endpointKey: botConfig.findServiceByNameOrId("192").endpointKey,
    host: botConfig.findServiceByNameOrId("192").hostname,
});
const luis = new botbuilder_ai_1.LuisRecognizer({
    applicationId: botConfig.findServiceByNameOrId("100").appId,
    endpointKey: botConfig.findServiceByNameOrId("100").authoringKey,
    endpoint: botConfig.findServiceByNameOrId("100").getEndpoint(),
});
const bot = new bot_1.ConfBot(qnaMaker, luis, dialogs, conversationState);
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        yield bot.onTurn(context);
    }));
});
//# sourceMappingURL=app.js.map