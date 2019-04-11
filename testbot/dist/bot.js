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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const OAUTH_PROMPT = 'oAuth_prompt';
const CONFIRM_PROMPT = 'confirm_prompt';
const AUTH_DIALOG = 'auth_dialog';
const HELP_TEXT = ' Type anything to get logged in. Type \'logout\' to signout.' +
    ' Type \'help\' to view this message again';
const CONNECTION_NAME = 'calendar';
const OAUTH_SETTINGS = {
    connectionName: CONNECTION_NAME,
    title: 'Sign In',
    text: 'Please Sign In',
    timeout: 300000
};
class ConfBot {
    constructor(qnaMaker, luis, dialogs, conversationState) {
        this._qnaMaker = qnaMaker;
        this._luis = luis;
        this._dialogs = dialogs;
        this._conversationState = conversationState;
        this._dialogs.add(new botbuilder_dialogs_1.ChoicePrompt(CONFIRM_PROMPT));
        this._dialogs.add(new botbuilder_dialogs_1.OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));
        this._dialogs.add(new botbuilder_dialogs_1.ChoicePrompt("choicePrompt"));
        this._dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(AUTH_DIALOG, [
            this.oauthPrompt,
            this.loginResults,
            this.displayToken,
            this.pickOptions,
            this.additionalOptions
        ]));
    }
    oauthPrompt(step) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield step.prompt(OAUTH_PROMPT, "oauth prompt");
        });
    }
    loginResults(step) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenResponse = step.result;
            if (tokenResponse != null) {
                yield step.context.sendActivity('You are now logged in.');
                return yield step.prompt(CONFIRM_PROMPT, 'Do you want to view your token?', ['yes', 'no']);
            }
            yield step.context.sendActivity('Login was not sucessful please try again');
            return yield step.endDialog();
        });
    }
    displayToken(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = step.result.value;
            if (result === 'yes') {
                let prompt = yield step.prompt(OAUTH_PROMPT, "oauthprompt");
                var tokenResponse = prompt.result;
                if (tokenResponse != null) {
                    yield step.context.sendActivity(`Here is your token: ${tokenResponse.token}`);
                    yield step.context.sendActivity(HELP_TEXT);
                    return yield step.endDialog();
                }
            }
            yield step.context.sendActivity(HELP_TEXT);
            return yield step.endDialog();
        });
    }
    pickOptions(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const choices = [
                "I want to know about a topic",
                "I want to know about a speaker",
                "I want to know about a venue"
            ];
            const options = {
                prompt: "What would you like to know?",
                choices: choices
            };
            return yield step.prompt("choicePrompt", options);
        });
    }
    additionalOptions(step) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (step.result.index) {
                case 0:
                    yield step.context.sendActivity(`You can ask:
                    * _Is thre a chatbot presentation?_
                    * _What is Michael Szul speaking about?_
                    * _Are there any Xamarin talks?_`);
                    break;
                default:
                    break;
            }
            return yield step.endDialog();
        });
    }
    onTurn(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const dc = yield this._dialogs.createContext(context);
            const text = context.activity.text;
            yield dc.continueDialog();
            if (!context.responded) {
                if (context.activity.type === botbuilder_1.ActivityTypes.ConversationUpdate) {
                    const welcomeMessage = `Welcome!` + HELP_TEXT;
                    yield context.sendActivity(welcomeMessage);
                }
                if (context.activity.type === 'message') {
                    const qnaResults = yield this._qnaMaker.generateAnswer(context.activity.text);
                    if (qnaResults && qnaResults.length > 0) {
                        yield context.sendActivity(qnaResults[0].answer);
                    }
                    else {
                        yield context.sendActivity(`Did not understand your query. Would you like to schedule an appointment with a human agent?`);
                    }
                }
                else {
                    yield context.sendActivity(`${context.activity.type} event detected`);
                }
            }
            yield this._conversationState.saveChanges(context);
        });
    }
}
exports.ConfBot = ConfBot;
//# sourceMappingURL=bot.js.map