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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const initialId = 'mainDialog';
// Names of the prompts the bot uses.
const OAUTH_PROMPT = 'oAuth_prompt';
// The connection name here must match the one from
// your Bot Channels Registration on the settings blade in Azure.
const CONNECTION_NAME = 'test';
// Create the settings for the OAuthPrompt.
const OAUTH_SETTINGS = {
    connectionName: CONNECTION_NAME,
    title: 'Sign In',
    text: 'Please Sign In',
    timeout: 300000 // User has 5 minutes to log in.
};
class AuthenticationDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(id, accessor) {
        super(id);
        this.accessor = accessor;
        this.initialDialogId = initialId;
        const authenticate = [
            this.promptToLogin.bind(this),
            this.finishLoginDialog.bind(this)
        ];
        this.addDialog(new botbuilder_dialogs_1.OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(this.initialDialogId, authenticate));
    }
    promptToLogin(step) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield step.prompt(OAUTH_PROMPT, {});
        });
    }
    finishLoginDialog(step) {
        return __awaiter(this, void 0, void 0, function* () {
            if (step.result) {
                const tokenResponse = step.result;
                if (tokenResponse.token) {
                    yield step.context.sendActivity(`You are now logged in.`);
                }
                return step.endDialog(tokenResponse);
            }
            else {
                yield step.context.sendActivity(`Login failed`);
            }
            return step.endDialog();
        });
    }
}
exports.AuthenticationDialog = AuthenticationDialog;
var DialogIds;
(function (DialogIds) {
    DialogIds["LoginPrompt"] = "loginPrompt";
})(DialogIds || (DialogIds = {}));
//# sourceMappingURL=authDialog.js.map