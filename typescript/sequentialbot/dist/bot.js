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
var WHO_ARE_YOU = 'who_are_you';
var HELLO_USER = 'hello_user';
var NAME_PROMPT = 'name_prompt';
var CONFIRM_PROMPT = 'confirm_prompt';
var AGE_PROMPT = 'age_prompt';
var SequentialBot = /** @class */ (function () {
    function SequentialBot(conversationState, userState) {
        var _this = this;
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userProfile = this.userState.createProperty(USER_PROFILE_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        this.dialogs.add(new botbuilder_dialogs_1.TextPrompt(NAME_PROMPT));
        this.dialogs.add(new botbuilder_dialogs_1.ChoicePrompt(CONFIRM_PROMPT));
        this.dialogs.add(new botbuilder_dialogs_1.NumberPrompt(AGE_PROMPT, function (prompt) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!prompt.recognized.succeeded) return [3 /*break*/, 3];
                        if (!(prompt.recognized.value && prompt.recognized.value <= 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, prompt.context.sendActivity("Your age can't be less than zero.")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, false];
                    case 2: return [2 /*return*/, true];
                    case 3: return [2 /*return*/, false];
                }
            });
        }); }));
        // Create a dialog that asks the user for their name.
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(WHO_ARE_YOU, [
            this.promptForName.bind(this),
            this.confirmAgePrompt.bind(this),
            this.promptForAge.bind(this),
            this.captureAge.bind(this)
        ]));
        // Create a dialog that displays a user name after it has been collected.
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(HELLO_USER, [
            this.displayProfile.bind(this)
        ]));
    }
    // This step in the dialog prompts the user for their name.
    SequentialBot.prototype.promptForName = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, step.prompt(NAME_PROMPT, "What is your name, human?")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // This step captures the user's name, then prompts whether or not to collect an age.
    SequentialBot.prototype.confirmAgePrompt = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userProfile.get(step.context, {})];
                    case 1:
                        user = _a.sent();
                        user.name = step.result;
                        return [4 /*yield*/, this.userProfile.set(step.context, user)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, step.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no'])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // This step checks the user's response - if yes, the bot will proceed to prompt for age.
    // Otherwise, the bot will skip the age step.
    SequentialBot.prototype.promptForAge = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(step.result && step.result.value === 'yes')) return [3 /*break*/, 2];
                        return [4 /*yield*/, step.prompt(AGE_PROMPT, "What is your age?")];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, step.next(-1)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // This step captures the user's age.
    SequentialBot.prototype.captureAge = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userProfile.get(step.context, {})];
                    case 1:
                        user = _a.sent();
                        if (!(step.result !== -1)) return [3 /*break*/, 4];
                        user.age = step.result;
                        return [4 /*yield*/, this.userProfile.set(step.context, user)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, step.context.sendActivity("I will remember that you are " + step.result + " years old.")];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, step.context.sendActivity("No age given.")];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, step.endDialog()];
                    case 7: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // This step displays the captured information back to the user.
    SequentialBot.prototype.displayProfile = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userProfile.get(step.context, {})];
                    case 1:
                        user = _a.sent();
                        if (!user.age) return [3 /*break*/, 3];
                        return [4 /*yield*/, step.context.sendActivity("Your name is " + user.name + " and you are " + user.age + " years old.")];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, step.context.sendActivity("Your name is " + user.name + " and you did not share your age.")];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, step.endDialog()];
                    case 6: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SequentialBot.prototype.onTurn = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var dc, utterance, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(context.activity.type === botbuilder_1.ActivityTypes.Message)) return [3 /*break*/, 7];
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
                        if (!!context.responded) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.userProfile.get(dc.context, {})];
                    case 3:
                        user = _a.sent();
                        if (!user.name) return [3 /*break*/, 5];
                        return [4 /*yield*/, dc.beginDialog(HELLO_USER)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, dc.beginDialog(WHO_ARE_YOU)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: 
                    // Save changes to the user state.
                    return [4 /*yield*/, this.userState.saveChanges(context)];
                    case 8:
                        // Save changes to the user state.
                        _a.sent();
                        // End this turn by saving changes to the conversation state.
                        return [4 /*yield*/, this.conversationState.saveChanges(context)];
                    case 9:
                        // End this turn by saving changes to the conversation state.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SequentialBot;
}());
exports.SequentialBot = SequentialBot;
//# sourceMappingURL=bot.js.map