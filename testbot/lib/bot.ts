import { ActivityTypes, TurnContext, ConversationState } from 'botbuilder';
import { QnAMaker, LuisRecognizer } from 'botbuilder-ai';
import { DialogTurnResult, OAuthPrompt, DialogSet, WaterfallDialog, ChoicePrompt, WaterfallStepContext, PromptOptions } from 'botbuilder-dialogs';

// Names of the prompts the bot uses.
const OAUTH_PROMPT = 'oAuth_prompt';
const CONFIRM_PROMPT = 'confirm_prompt';

// Name of the WaterfallDialog the bot uses.
const AUTH_DIALOG = 'auth_dialog';
const HELP_DIALOG = 'help_dialog';

// Text to help guide the user through using the bot.
const HELP_TEXT = ' Type anything to get logged in. Type \'logout\' to signout.' +
    ' Type \'help\' to view this message again';

// The connection name here must match the one from
// your Bot Channels Registration on the settings blade in Azure.
const CONNECTION_NAME = 'graphtest';

// Create the settings for the OAuthPrompt.
const OAUTH_SETTINGS = {
    connectionName: CONNECTION_NAME,
    title: 'Sign In',
    text: 'Please Sign In',
    timeout: 300000 // User has 5 minutes to log in.
};

export class ConfBot {
    private _qnaMaker: QnAMaker;
    private _luis: LuisRecognizer;
    private _dialogs: DialogSet;
    private _conversationState: ConversationState;

    constructor(qnaMaker: QnAMaker, luis: LuisRecognizer, dialogs: DialogSet, conversationState: ConversationState) {
        this._qnaMaker = qnaMaker;
        this._luis = luis;
        this._dialogs = dialogs;
        this._conversationState = conversationState;
        // Add prompts that will be used by the bot.
        this._dialogs.add(new ChoicePrompt(CONFIRM_PROMPT));
        this._dialogs.add(new OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));
        this._dialogs.add(new ChoicePrompt("choicePrompt"));

        this._dialogs.add(new WaterfallDialog(HELP_DIALOG, [
            this.helpAgent.bind(this),
            this.endHelp.bind(this)
        ]));

        const authenticate: ((sc: WaterfallStepContext<{}>) => Promise<DialogTurnResult<any>>)[] = [
            this.oauthPrompt.bind(this),
            this.loginResults.bind(this),
            this.displayToken.bind(this),
        ];

        // The WaterfallDialog that controls the flow of the conversation.
        this._dialogs.add(new WaterfallDialog(AUTH_DIALOG, authenticate));
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
    async loginResults(step: WaterfallStepContext): Promise<DialogTurnResult> {
        let tokenResponse = step.result;
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
        if (result === 'yes') {
            // Call the prompt again because we need the token. The reasons for this are:
            // 1. If the user is already logged in we do not need to store the token locally in the bot and worry
            // about refreshing it. We can always just call the prompt again to get the token.
            // 2. We never know how long it will take a user to respond. By the time the
            // user responds the token may have expired. The user would then be prompted to login again.
            //
            // There is no reason to store the token locally in the bot because we can always just call
            // the OAuth prompt to get the token or get a new token if needed.
            let prompt = await step.prompt(OAUTH_PROMPT, "oauthprompt");
            var tokenResponse = prompt.result;
            if (tokenResponse != null) {
                await step.context.sendActivity(`Here is your token: ${ tokenResponse.token }`);
                await step.context.sendActivity(HELP_TEXT);
                return await step.endDialog();
            }
        }

        await step.context.sendActivity(HELP_TEXT);
        return await step.endDialog();
    }

    async helpAgent (step: WaterfallStepContext)  {
        const choices = [
            "Yes",
            "No"
        ];
        const options : PromptOptions = {
            prompt: "I did not understand. Would you like to schedule a meeting with a human agent?",
            choices: choices
        };
        return await step.prompt("choicePrompt", options);
    }

    async endHelp (step: WaterfallStepContext) {
        const response = step.result.value;
        //await step.context.sendActivity(`You selected ${response}`);
        if (response == 'Yes') {
            await step.beginDialog(AUTH_DIALOG);
        }
        return await step.endDialog();
    }

    async onTurn(context: TurnContext) {
        const dc = await this._dialogs.createContext(context);
        //const text = context.activity.text;

        await dc.continueDialog();
        
        if (!context.responded) {

            if (context.activity.type === ActivityTypes.ConversationUpdate) {
                // Send a greeting to new members that join the conversation.
                const welcomeMessage = `Welcome!` + HELP_TEXT;
                await context.sendActivity(welcomeMessage);
            }

            if (context.activity.type === 'message') {
                const qnaResults = await this._qnaMaker.generateAnswer(context.activity.text);
                if (qnaResults && qnaResults.length > 0 && qnaResults[0].score > 0.60) {
                    await context.sendActivity(qnaResults[0].answer);
                } else {
                    await dc.beginDialog(HELP_DIALOG);
                }
            } else {
                await context.sendActivity(`${context.activity.type} event detected`);
            }
        }

        await this._conversationState.saveChanges(context);
    }
}

        //const dc = await this.dialogs.createContext(turnContext);
        //await dc.continueDialog();
        //if (!turnContext.responded) {
            //await dc.beginDialog(AUTH_DIALOG);
        //}
        // Update the conversation state before ending the turn.
