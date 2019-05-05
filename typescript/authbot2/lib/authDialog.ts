import { TokenResponse, StatePropertyAccessor } from 'botbuilder';
import { ComponentDialog, OAuthPrompt, DialogTurnResult, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';

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

export class AuthenticationDialog extends ComponentDialog {
    constructor(id: string, private accessor: StatePropertyAccessor) {
        super(id);
        this.initialDialogId = initialId;

        const authenticate : ((sc: WaterfallStepContext<{}>) => Promise<DialogTurnResult<any>>)[] = [
            this.promptToLogin.bind(this),
            this.finishLoginDialog.bind(this)
        ];

        this.addDialog(new OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));
        this.addDialog(new WaterfallDialog(this.initialDialogId, authenticate));
    }

    private async promptToLogin(step: WaterfallStepContext) {
        return await step.prompt(OAUTH_PROMPT, {});
    }

    private async finishLoginDialog(step: WaterfallStepContext) {
        if (step.result) {
            const tokenResponse: TokenResponse = step.result;

            if (tokenResponse.token) {
                await step.context.sendActivity(`You are now logged in.`);
            }

            return step.endDialog(tokenResponse);
        } else {
            await step.context.sendActivity(`Login failed`);
        }

        return step.endDialog();
    }

    //private async getProfile(step: WaterfallStepContext) {

    //}
}


enum DialogIds {
    LoginPrompt =  'loginPrompt'
}
