import { BotAdapter, ActivityTypes, TurnContext, ConversationState } from 'botbuilder';
import { QnAMaker, LuisRecognizer } from 'botbuilder-ai';
import { OAuthPrompt, DialogSet, WaterfallDialog, ChoicePrompt, WaterfallStepContext, PromptOptions } from 'botbuilder-dialogs';

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
const CONNECTION_NAME = 'calendar';

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

        // The WaterfallDialog that controls the flow of the conversation.
        this._dialogs.add(new WaterfallDialog(AUTH_DIALOG, [
            this.oauthPrompt,
            this.loginResults,
            this.displayToken,
            this.pickOptions,
            this.additionalOptions
        ]));
    }

    /**
     * Waterfall step that prompts the user to login if they have not already or their token has expired.
     * @param {WaterfallStepContext} step
     */
    async oauthPrompt(step: WaterfallStepContext) {
        return await step.prompt(OAUTH_PROMPT, "oauth prompt");
    }

    /**
     * Waterfall step that informs the user that they are logged in and asks
     * the user if they would like to see their token via a prompt
     * @param {WaterfallStepContext} step
     */
    async loginResults(step: WaterfallStepContext) {
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

    async pickOptions (step: WaterfallStepContext)  {
        const choices = [
            "I want to know about a topic", 
            "I want to know about a speaker",
            "I want to know about a venue"
        ];
        const options : PromptOptions = {
            prompt: "What would you like to know?",
            choices: choices
        };
        return await step.prompt("choicePrompt", options);
    }

    async additionalOptions(step: WaterfallStepContext) {
        switch(step.result.index) {
            case 0:
                await step.context.sendActivity(`You can ask:
                    * _Is thre a chatbot presentation?_
                    * _What is Michael Szul speaking about?_
                    * _Are there any Xamarin talks?_`);
                break;
            default:
                break;
        }
        return await step.endDialog();
    }


    async onTurn(context: TurnContext) {
        const dc = await this._dialogs.createContext(context);
        const text = context.activity.text;

        const validCommands = ['logout', 'help'];
        await dc.continueDialog();
        
        // If the user asks for help, send a message to them informing them of the operations they can perform.
        if (validCommands.includes(text)) {
            if (text === 'help') {
                await context.sendActivity(HELP_TEXT);
            }
            // Log the user out
            if (text === 'logout') {
                let botAdapter: BotAdapter = context.adapter;
                //await botAdapter.signOutUser(context, CONNECTION_NAME);
                await context.sendActivity('You have been signed out.');
                await context.sendActivity(HELP_TEXT);
            }
        } else {
            if (!context.responded) {
                await dc.beginDialog(AUTH_DIALOG);
            }
        };
        if (context.activity.type === ActivityTypes.ConversationUpdate) {
            // Send a greeting to new members that join the conversation.
            const welcomeMessage = `Welcome!` + HELP_TEXT;
            await context.sendActivity(welcomeMessage);
        };

        if (text != null && text === "continue") {
            await dc.beginDialog("help");
        }

        if (context.activity.type === 'message') {
            const qnaResults = await this._qnaMaker.generateAnswer(context.activity.text);
            if (qnaResults && qnaResults.length > 0) {
                await context.sendActivity(qnaResults[0].answer);
            } else {
                console.log(context);

                await this._luis.recognize(context).then( async res => {
                    const top = LuisRecognizer.topIntent(res);
                    await context.sendActivity(`the top intent found was ${top}`);
                })
                    .catch(err => console.error(err));
            }
        } else {
            await context.sendActivity(`${context.activity.type} event detected`);
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
