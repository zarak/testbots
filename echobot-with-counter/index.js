"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
// Import required packages
var path = require("path");
var restify = require("restify");
// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
var botbuilder_1 = require("botbuilder");
// Import required bot configuration.
var botframework_config_1 = require("botframework-config");
var bot_1 = require("./bot");
// Read botFilePath and botFileSecret from .env file
// Note: Ensure you have a .env file and include botFilePath and botFileSecret.
var ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });
// Get the .bot file path
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.
var BOT_FILE = path.join(__dirname, (process.env.botFilePath || ''));
// Read bot configuration from .bot file.
var botConfig = botframework_config_1.BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
// For local development configuration as defined in .bot file
var DEV_ENVIRONMENT = 'development';
// Define name of the endpoint configuration section from the .bot file
var BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);
// Create bot adapter.
// See https://aka.ms/about-bot-adapter to learn more about bot adapter.
var adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword
});
// Catch-all for any unhandled errors in your bot.
adapter.onTurnError = function (context, error) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // This check writes out errors to console log .vs. app insights.
                console.error("\n [onTurnError]: " + error);
                // Send a message to the user
                return [4 /*yield*/, context.sendActivity("Oops. Something went wrong!")];
            case 1:
                // Send a message to the user
                _a.sent();
                // Clear out state
                return [4 /*yield*/, conversationState["delete"](context)];
            case 2:
                // Clear out state
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.
var conversationState;
// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
var memoryStorage = new botbuilder_1.MemoryStorage();
conversationState = new botbuilder_1.ConversationState(memoryStorage);
// CAUTION: You must ensure your product environment has the NODE_ENV set
//          to use the Azure Blob storage or Azure Cosmos DB providers.
// const { BlobStorage } = require('botbuilder-azure');
// Storage configuration name or ID from .bot file
// const STORAGE_CONFIGURATION_ID = '<STORAGE-NAME-OR-ID-FROM-BOT-FILE>';
// // Default container name
// const DEFAULT_BOT_CONTAINER = '<DEFAULT-CONTAINER>';
// // Get service configuration
// const blobStorageConfig = botConfig.findServiceByNameOrId(STORAGE_CONFIGURATION_ID);
// const blobStorage = new BlobStorage({
//     containerName: (blobStorageConfig.container || DEFAULT_BOT_CONTAINER),
//     storageAccountOrConnectionString: blobStorageConfig.connectionString,
// });
// conversationState = new ConversationState(blobStorage);
// Create the main dialog.
var bot = new bot_1.EchoBot(conversationState);
// Create HTTP server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log("\n" + server.name + " listening to " + server.url);
    console.log("\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator");
    console.log("\nTo talk to your bot, open echoBot-with-counter.bot file in the Emulator");
});
// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', function (req, res) {
    adapter.processActivity(req, res, function (context) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // route to main dialog.
                return [4 /*yield*/, bot.onTurn(context)];
                case 1:
                    // route to main dialog.
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
