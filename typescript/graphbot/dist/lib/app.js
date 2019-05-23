"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const restify = __importStar(require("restify"));
const dotenv_1 = require("dotenv");
const authBot_1 = require("./bots/authBot");
const mainDialog_1 = require("./dialogs/mainDialog");
dotenv_1.config();
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`Listening on ${server.url}`);
});
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
});
console.log("ADAPTER", adapter);
const memoryStorage = new botbuilder_1.MemoryStorage();
const conversationState = new botbuilder_1.ConversationState(memoryStorage);
const commandState = new botbuilder_1.ConversationState(memoryStorage);
const userState = new botbuilder_1.UserState(memoryStorage);
const dialog = new mainDialog_1.MainDialog(commandState);
const bot = new authBot_1.AuthBot(conversationState, userState, dialog);
server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield bot.run(context);
        }
        catch (err) {
            console.error(err);
        }
    }));
});
//# sourceMappingURL=app.js.map