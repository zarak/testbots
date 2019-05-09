// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { WaterfallStepContext, ChoicePrompt, DialogSet, DialogTurnStatus, OAuthPrompt, TextPrompt, WaterfallDialog } from 'botbuilder-dialogs';
import { ConversationState, TurnContext, StatePropertyAccessor } from 'botbuilder';
import { LogoutDialog } from './logoutDialog';
import { OAuthHelpers } from '../../oAuthHelpers';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const OAUTH_PROMPT = 'oAuthPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const TEXT_PROMPT = 'textPrompt';

export class MainDialog extends LogoutDialog {
    public commandStateAccessor: StatePropertyAccessor;
    constructor(private commandState: ConversationState) {
        super('MainDialog');

        this.commandStateAccessor = commandState.createProperty('commandState');

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new OAuthPrompt(OAUTH_PROMPT, {
                connectionName: 'test',
                text: 'Please login',
                title: 'Login',
                timeout: 300000
            }))
            .addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
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
    async run(turnContext: TurnContext, accessor: StatePropertyAccessor) {
        const dialogSet: DialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async promptStep(step: WaterfallStepContext) {
        return step.beginDialog(OAUTH_PROMPT);
    }

    async loginStep(step: WaterfallStepContext) {
        // Get the token from the previous step. Note that we could also have gotten the
        // token directly from the prompt itself. There is an example of this in the next method.
        const tokenResponse = step.result;
        if (tokenResponse) {
            await step.context.sendActivity('You are now logged in.');
            return await step.prompt(TEXT_PROMPT, { prompt: 'Would you like to do? (type \'me\', \'send <EMAIL>\' or \'recent\')' });
        }
        await step.context.sendActivity('Login was not successful please try again.');
        return await step.endDialog();
    }

    async commandStep(step: WaterfallStepContext) {
        //step.values['command'] = step.result;
        await this.commandStateAccessor.set(step.context, { command: step.result });

        // Call the prompt again because we need the token. The reasons for this are:
        // 1. If the user is already logged in we do not need to store the token locally in the bot and worry
        // about refreshing it. We can always just call the prompt again to get the token.
        // 2. We never know how long it will take a user to respond. By the time the
        // user responds the token may have expired. The user would then be prompted to login again.
        //
        // There is no reason to store the token locally in the bot because we can always just call
        // the OAuth prompt to get the token or get a new token if needed.
        return await step.beginDialog(OAUTH_PROMPT);
    }

    async processStep(step: WaterfallStepContext) {
        if (step.result) {
            // We do not need to store the token in the bot. When we need the token we can
            // send another prompt. If the token is valid the user will not need to log back in.
            // The token will be available in the Result property of the task.
            const tokenResponse = step.result;

            // If we have the token use the user is authenticated so we may use it to make API calls.
            if (tokenResponse && tokenResponse.token) {
                const parts = (await this.commandStateAccessor.get(step.context, { command: '' })).command.toLowerCase().split(' ');

                const command = parts[0];

                switch (command) {
                case 'me':
                    await OAuthHelpers.listMe(step.context, tokenResponse);
                    break;
                case 'send':
                    await OAuthHelpers.sendMail(step.context, tokenResponse, parts[1]);
                    break;
                case 'recent':
                    //await OAuthHelpers.listRecentMail(step.context, tokenResponse);
                    break;
                default:
                    await step.context.sendActivity(`Your token is ${ tokenResponse.token }`);
                }
            }
        } else {
            await step.context.sendActivity('We couldn\'t log you in. Please try again later.');
        }

        return await step.endDialog();
    }
}
