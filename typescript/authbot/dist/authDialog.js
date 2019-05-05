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
const CONFIRM_PROMPT = 'confirm_prompt';
// Text to help guide the user through using the bot.
const HELP_TEXT = ' Type anything to get logged in. Type \'logout\' to signout.' +
    ' Type \'help\' to view this message again';
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
            this.oauthPrompt.bind(this),
            this.loginResults.bind(this),
            this.displayToken.bind(this)
        ];
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CONFIRM_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(this.initialDialogId, authenticate));
    }
    /**
     * Waterfall step that prompts the user to login if they have not already or their token has expired.
     * @param {WaterfallStepContext} step
     */
    oauthPrompt(step) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield step.prompt(OAUTH_PROMPT, {});
        });
    }
    /**
     * Waterfall step that informs the user that they are logged in and asks
     * the user if they would like to see their token via a prompt
     * @param {WaterfallStepContext} step
     */
    loginResults(step) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenResponse = step.result;
            //console.log(tokenResponse);
            if (tokenResponse != null) {
                yield step.context.sendActivity('You are now logged in.');
                return yield step.prompt(CONFIRM_PROMPT, 'Do you want to view your token?', ['yes', 'no']);
            }
            // Something went wrong, inform the user they were not logged in
            yield step.context.sendActivity('Login was not sucessful please try again');
            return yield step.endDialog();
        });
    }
    /**
     *
     * Waterfall step that will display the user's token. If the user's token is expired
     * or they are not logged in this will prompt them to log in first.
     * @param {WaterfallStepContext} step
     */
    displayToken(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = step.result.value;
            let prompt = yield step.prompt(OAUTH_PROMPT, {});
            var tokenResponse = prompt.result;
            if (result === 'yes') {
                // Call the prompt again because we need the token. The reasons for this are:
                // 1. If the user is already logged in we do not need to store the token locally in the bot and worry
                // about refreshing it. We can always just call the prompt again to get the token.
                // 2. We never know how long it will take a user to respond. By the time the
                // user responds the token may have expired. The user would then be prompted to login again.
                //
                // There is no reason to store the token locally in the bot because we can always just call
                // the OAuth prompt to get the token or get a new token if needed.
                console.log("token", tokenResponse);
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
}
exports.AuthenticationDialog = AuthenticationDialog;
var DialogIds;
(function (DialogIds) {
    DialogIds["LoginPrompt"] = "loginPrompt";
})(DialogIds || (DialogIds = {}));
//# sourceMappingURL=authDialog.js.map