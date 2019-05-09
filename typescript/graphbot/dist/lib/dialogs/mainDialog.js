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
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logoutDialog_1 = require("./logoutDialog");
const oAuthHelpers_1 = require("../../oAuthHelpers");
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const OAUTH_PROMPT = 'oAuthPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';
class MainDialog extends logoutDialog_1.LogoutDialog {
    constructor(commandState) {
        super('MainDialog');
        this.commandState = commandState;
        this.commandStateAccessor = commandState.createProperty('commandState');
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new botbuilder_dialogs_1.OAuthPrompt(OAUTH_PROMPT, {
            connectionName: 'test',
            text: 'Please login',
            title: 'Login',
            timeout: 300000
        }))
            .addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.promptStep.bind(this),
            this.loginStep.bind(this),
            this.commandStep.bind(this),
            this.processStep.bind(this)
        ]));
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }
    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    run(turnContext, accessor) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
            dialogSet.add(this);
            const dialogContext = yield dialogSet.createContext(turnContext);
            const results = yield dialogContext.continueDialog();
            if (results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
                yield dialogContext.beginDialog(this.id);
            }
        });
    }
    promptStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            return step.beginDialog(OAUTH_PROMPT);
        });
    }
    loginStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the token from the previous step. Note that we could also have gotten the
            // token directly from the prompt itself. There is an example of this in the next method.
            const tokenResponse = step.result;
            if (tokenResponse) {
                yield step.context.sendActivity('You are now logged in.');
                return yield step.prompt(TEXT_PROMPT, { prompt: 'Would you like to do? (type \'me\', \'send <EMAIL>\' or \'recent\')' });
            }
            yield step.context.sendActivity('Login was not successful please try again.');
            return yield step.endDialog();
        });
    }
    commandStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            //step.values['command'] = step.result;
            yield this.commandStateAccessor.set(step.context, { command: step.result });
            // Call the prompt again because we need the token. The reasons for this are:
            // 1. If the user is already logged in we do not need to store the token locally in the bot and worry
            // about refreshing it. We can always just call the prompt again to get the token.
            // 2. We never know how long it will take a user to respond. By the time the
            // user responds the token may have expired. The user would then be prompted to login again.
            //
            // There is no reason to store the token locally in the bot because we can always just call
            // the OAuth prompt to get the token or get a new token if needed.
            return yield step.beginDialog(OAUTH_PROMPT);
        });
    }
    processStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            if (step.result) {
                // We do not need to store the token in the bot. When we need the token we can
                // send another prompt. If the token is valid the user will not need to log back in.
                // The token will be available in the Result property of the task.
                const tokenResponse = step.result;
                // If we have the token use the user is authenticated so we may use it to make API calls.
                if (tokenResponse && tokenResponse.token) {
                    const parts = (yield this.commandStateAccessor.get(step.context, { command: '' })).command.toLowerCase().split(' ');
                    const command = parts[0];
                    switch (command) {
                        case 'me':
                            yield oAuthHelpers_1.OAuthHelpers.listMe(step.context, tokenResponse);
                            break;
                        case 'send':
                            yield oAuthHelpers_1.OAuthHelpers.sendMail(step.context, tokenResponse, parts[1]);
                            break;
                        case 'recent':
                            //await OAuthHelpers.listRecentMail(step.context, tokenResponse);
                            break;
                        default:
                            yield step.context.sendActivity(`Your token is ${tokenResponse.token}`);
                    }
                }
            }
            else {
                yield step.context.sendActivity('We couldn\'t log you in. Please try again later.');
            }
            return yield step.endDialog();
        });
    }
}
exports.MainDialog = MainDialog;
//# sourceMappingURL=mainDialog.js.map