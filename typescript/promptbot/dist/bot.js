"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var botbuilder_dialogs_1 = require("botbuilder-dialogs");
var DIALOG_STATE_PROPERTY = 'dialogState';
var USER_PROFILE_PROPERTY = 'userProfile';
// Dialog contexts
var ROOT = 'root';
var NAME_PROMPT = 'name_prompt';
var PromptBot = /** @class */ (function () {
    function PromptBot(conversationState, userState) {
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userProfile = this.userState.createProperty(USER_PROFILE_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        this.dialogs.add(new botbuilder_dialogs_1.TextPrompt(NAME_PROMPT)); // TextPrompt returns a string
        // Create a dialog that asks the user for their name.
        var onboarding = [
            this.promptForName.bind(this),
            this.displayName.bind(this)
        ];
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(ROOT, onboarding));
    }
    // This step in the dialog prompts the user for their name.
    PromptBot.prototype.promptForName = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, step.prompt(NAME_PROMPT, "What is your name, human?")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PromptBot.prototype.displayName = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var userData, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userData = { name: '' };
                        return [4 /*yield*/, this.userProfile.get(step.context, userData)];
                    case 1:
                        user = _a.sent();
                        user.name = step.result;
                        return [4 /*yield*/, this.userProfile.set(step.context, user)];
                    case 2:
                        _a.sent();
                        console.log(user.name);
                        return [2 /*return*/, step.endDialog()];
                }
            });
        });
    };
    PromptBot.prototype.onTurn = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var dc, utterance, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(context.activity.type === botbuilder_1.ActivityTypes.Message)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.dialogs.createContext(context)];
                    case 1:
                        dc = _a.sent();
                        utterance = (context.activity.text || '').trim().toLowerCase();
                        // If the bot has not yet responded, continue processing the current
                        // dialog.
                        return [4 /*yield*/, dc.continueDialog()];
                    case 2:
                        // If the bot has not yet responded, continue processing the current
                        // dialog.
                        _a.sent();
                        if (!!context.responded) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.userProfile.get(dc.context, {})];
                    case 3:
                        user = _a.sent();
                        if (!user.name) return [3 /*break*/, 6];
                        return [4 /*yield*/, context.sendActivity("Hello " + user.name)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, dc.endDialog()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, dc.beginDialog(ROOT)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: 
                    // Save changes to the user state.
                    return [4 /*yield*/, this.userState.saveChanges(context)];
                    case 9:
                        // Save changes to the user state.
                        _a.sent();
                        // End this turn by saving changes to the conversation state.
                        return [4 /*yield*/, this.conversationState.saveChanges(context)];
                    case 10:
                        // End this turn by saving changes to the conversation state.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return PromptBot;
}());
exports.PromptBot = PromptBot;
//# sourceMappingURL=bot.js.map