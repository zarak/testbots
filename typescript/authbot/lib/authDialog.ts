import * as i18n from 'i18n';
import { TurnContext, ActivityTypes, StatePropertyAccessor } from 'botbuilder';
import { ChoicePrompt, ComponentDialog, OAuthPrompt, DialogTurnResult, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';

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

export class AuthenticationDialog extends ComponentDialog {
    constructor(id: string, private accessor: StatePropertyAccessor) {
        super(id);
        this.initialDialogId = initialId;

        const authenticate : ((sc: WaterfallStepContext<{}>) => Promise<DialogTurnResult<any>>)[] = [
            this.oauthPrompt.bind(this),
            this.loginResults.bind(this),
            this.displayToken.bind(this)
        ];

        this.addDialog(new ChoicePrompt(CONFIRM_PROMPT));
        this.addDialog(new OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));
        this.addDialog(new WaterfallDialog(this.initialDialogId, authenticate));
    }

    /**
     * Waterfall step that prompts the user to login if they have not already or their token has expired.
     * @param {WaterfallStepContext} step
     */
    async oauthPrompt(step: WaterfallStepContext) {
        return await step.prompt(OAUTH_PROMPT, {});
    }

    /**
     * Waterfall step that informs the user that they are logged in and asks
     * the user if they would like to see their token via a prompt
     * @param {WaterfallStepContext} step
     */
    async loginResults(step: WaterfallStepContext) {
        let tokenResponse = step.result;
        //console.log(tokenResponse);
        if (tokenResponse != null) {
            await step.context.sendActivity('You are now logged in.');
            return await step.prompt(CONFIRM_PROMPT, 'Do you want to view your token?', ['yes', 'no']);
        }

        // Something went wrong, inform the user they were not logged in
        await step.context.sendActivity('Login was not sucessful please try again');
        return await step.endDialog();
    }

    /**
     *
     * Waterfall step that will display the user's token. If the user's token is expired
     * or they are not logged in this will prompt them to log in first.
     * @param {WaterfallStepContext} step
     */
    async displayToken(step: WaterfallStepContext) {
        const result = step.result.value;
        let prompt = await step.prompt(OAUTH_PROMPT, {});
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
                await step.context.sendActivity(`Here is your token: ${ tokenResponse.token }`);
                await step.context.sendActivity(HELP_TEXT);
                return await step.endDialog();
            }
        }

        await step.context.sendActivity(HELP_TEXT);
        return await step.endDialog();
    }
}


enum DialogIds {
    LoginPrompt =  'loginPrompt'
}
