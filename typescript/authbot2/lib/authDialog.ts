import * as i18n from 'i18n';
import { TurnContext, ActivityTypes, StatePropertyAccessor } from 'botbuilder';
import { ChoicePrompt, ComponentDialog, OAuthPrompt, DialogTurnResult, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';

const initialId = 'mainDialog';

// Names of the prompts the bot uses.
const OAUTH_PROMPT = 'oAuth_prompt';
const CONFIRM_PROMPT = 'confirm_prompt';

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
        ];

        this.addDialog(new ChoicePrompt(CONFIRM_PROMPT));
        this.addDialog(new OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));
        this.addDialog(new WaterfallDialog(this.initialDialogId, authenticate));
    }

}


enum DialogIds {
    LoginPrompt =  'loginPrompt'
}
