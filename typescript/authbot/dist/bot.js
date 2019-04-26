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
// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
// Names of the prompts the bot uses.
const OAUTH_PROMPT = 'oAuth_prompt';
const CONFIRM_PROMPT = 'confirm_prompt';
// Name of the WaterfallDialog the bot uses.
const AUTH_DIALOG = 'auth_dialog';
// Text to help guide the user through using the bot.
const HELP_TEXT = ' Type anything to get logged in. Type \'logout\' to signout.' +
    ' Type \'help\' to view this message again';
// The connection name here must match the one from
// your Bot Channels Registration on the settings blade in Azure.
const CONNECTION_NAME = '';
// Create the settings for the OAuthPrompt.
const OAUTH_SETTINGS = {
    connectionName: CONNECTION_NAME,
    title: 'Sign In',
    text: 'Please Sign In',
    timeout: 300000 // User has 5 minutes to log in.
};
class AuthBot {
    constructor(conversationState, userState) {
        this.conversationState = conversationState;
        this.userState = userState;
        // Create a new state accessor property.
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        // Add prompts that will be used by the bot.
        this.dialogs.add(new botbuilder_dialogs_1.ChoicePrompt(CONFIRM_PROMPT));
        this.dialogs.add(new botbuilder_dialogs_1.OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));
        const toplevel = [
            this.oauthPrompt.bind(this),
            this.loginResults.bind(this),
            this.displayToken.bind(this)
        ];
        // The WaterfallDialog that controls the flow of the conversation.
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(AUTH_DIALOG, []));
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
            if (result === 'yes') {
                // Call the prompt again because we need the token. The reasons for this are:
                // 1. If the user is already logged in we do not need to store the token locally in the bot and worry
                // about refreshing it. We can always just call the prompt again to get the token.
                // 2. We never know how long it will take a user to respond. By the time the
                // user responds the token may have expired. The user would then be prompted to login again.
                //
                // There is no reason to store the token locally in the bot because we can always just call
                // the OAuth prompt to get the token or get a new token if needed.
                let prompt = yield step.prompt(OAUTH_PROMPT, {});
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
    onTurn(turnContext) {
        return __awaiter(this, void 0, void 0, function* () {
            // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
            if (turnContext.activity.type === botbuilder_1.ActivityTypes.Message) {
                // Create a dialog context object.
                const dc = yield this.dialogs.createContext(turnContext);
                const text = turnContext.activity.text;
                // Create an array with the valid options.
                const validCommands = ['logout', 'help'];
                yield dc.continueDialog();
                // If the user asks for help, send a message to them informing them of the operations they can perform.
                if (validCommands.includes(text)) {
                    if (text === 'help') {
                        yield turnContext.sendActivity(HELP_TEXT);
                    }
                    // Log the user out
                    if (text === 'logout') {
                        let botAdapter = turnContext.adapter; // But BotAdaptor does not have signOutUser method?
                        //await botAdapter.signOutUser(turnContext, CONNECTION_NAME);
                        yield turnContext.sendActivity('You have been signed out.');
                        yield turnContext.sendActivity(HELP_TEXT);
                    }
                }
                else {
                    if (!turnContext.responded) {
                        yield dc.beginDialog(AUTH_DIALOG);
                    }
                }
                ;
            }
            else if (turnContext.activity.type === botbuilder_1.ActivityTypes.ConversationUpdate) {
                const welcomeMessage = `Welcome to AuthenticationBot. ` + HELP_TEXT;
                yield turnContext.sendActivity(welcomeMessage);
            }
            else if (turnContext.activity.type === botbuilder_1.ActivityTypes.Invoke || turnContext.activity.type === botbuilder_1.ActivityTypes.Event) {
                // This handles the MS Teams Invoke Activity sent when magic code is not used.
                // See: https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/auth-oauth-card#getting-started-with-oauthcard-in-teams
                // The Teams manifest schema is found here: https://docs.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema
                // It also handles the Event Activity sent from the emulator when the magic code is not used.
                // See: https://blog.botframework.com/2018/08/28/testing-authentication-to-your-bot-using-the-bot-framework-emulator/
                const dc = yield this.dialogs.createContext(turnContext);
                yield dc.continueDialog();
                if (!turnContext.responded) {
                    yield dc.beginDialog(AUTH_DIALOG);
                }
            }
            else {
                yield turnContext.sendActivity(`[${turnContext.activity.type} event detected.]`);
            }
            // Update the conversation state before ending the turn.
            yield this.conversationState.saveChanges(turnContext);
        });
    }
}
exports.AuthBot = AuthBot;
//# sourceMappingURL=bot.js.map