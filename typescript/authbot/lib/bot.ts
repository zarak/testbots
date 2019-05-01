import { BotFrameworkAdapter, UserState, TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState } from 'botbuilder';
import { OAuthPrompt, DialogTurnResult, ChoicePrompt, DialogSet, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';

// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
const USER_INFO_PROPERTY = 'userInfoProperty';

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
const CONNECTION_NAME = 'test';

// Create the settings for the OAuthPrompt.
const OAUTH_SETTINGS = {
    connectionName: CONNECTION_NAME,
    title: 'Sign In',
    text: 'Please Sign In',
    timeout: 300000 // User has 5 minutes to log in.
};

export class AuthBot {
    /**
     *
     * @param {ConversationState} conversation state object
     * @param {UserState} user state object
     */
    private dialogState: StatePropertyAccessor;
    private userAccessor: StatePropertyAccessor;
    private dialogs: DialogSet;

    constructor(private conversationState: ConversationState, private userState: UserState) {
        
        // Create a new state accessor property.
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userAccessor = this.userState.createProperty(USER_INFO_PROPERTY);
        this.dialogs = new DialogSet(this.dialogState);

        // Add prompts that will be used by the bot.
        this.dialogs.add(new ChoicePrompt(CONFIRM_PROMPT));
        this.dialogs.add(new OAuthPrompt(OAUTH_PROMPT, OAUTH_SETTINGS));

        const toplevel : ((sc: WaterfallStepContext<{}>) => Promise<DialogTurnResult<any>>)[] = [
            this.oauthPrompt.bind(this),
            this.loginResults.bind(this),
            this.displayToken.bind(this)
        ];

        // The WaterfallDialog that controls the flow of the conversation.
        this.dialogs.add(new WaterfallDialog(AUTH_DIALOG, toplevel));

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
        console.log(tokenResponse);
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
            let prompt = await step.prompt(OAUTH_PROMPT, {});
            var tokenResponse = prompt.result;
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

    async onTurn(turnContext: TurnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Create a dialog context object.
            const dc = await this.dialogs.createContext(turnContext);
            const text = turnContext.activity.text;

            // Create an array with the valid options.
            const validCommands = ['logout', 'help'];
            await dc.continueDialog();

            // If the user asks for help, send a message to them informing them of the operations they can perform.
            if (validCommands.includes(text)) {
                if (text === 'help') {
                    await turnContext.sendActivity(HELP_TEXT);
                }
                // Log the user out
                if (text === 'logout') {
                    let botAdapter = turnContext.adapter; // But BotAdaptor does not have signOutUser method?

                    //await botAdapter.signOutUser(turnContext, CONNECTION_NAME);
                    await turnContext.sendActivity('You have been signed out.');
                    await turnContext.sendActivity(HELP_TEXT);
                }
            } else {
                if (!turnContext.responded) {
                    await dc.beginDialog(AUTH_DIALOG);
                }
            };
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
                const welcomeMessage = `Welcome to AuthenticationBot. ` + HELP_TEXT;
                await turnContext.sendActivity(welcomeMessage);
        } else if (turnContext.activity.type === ActivityTypes.Invoke || turnContext.activity.type === ActivityTypes.Event) {
            // This handles the MS Teams Invoke Activity sent when magic code is not used.
            // See: https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/auth-oauth-card#getting-started-with-oauthcard-in-teams
            // The Teams manifest schema is found here: https://docs.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema
            // It also handles the Event Activity sent from the emulator when the magic code is not used.
            // See: https://blog.botframework.com/2018/08/28/testing-authentication-to-your-bot-using-the-bot-framework-emulator/
            const dc = await this.dialogs.createContext(turnContext);
            await dc.continueDialog();
            if (!turnContext.responded) {
                await dc.beginDialog(AUTH_DIALOG);
            }
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected.]`);
        }

        // Update the conversation state before ending the turn.
        await this.conversationState.saveChanges(turnContext);
    }
}
