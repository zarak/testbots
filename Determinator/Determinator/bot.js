const { DialogSet, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { ActivityTypes, MemoryStorage, ConversationState } = require('botbuilder');

class EchoBot {
    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            await turnContext.sendActivity("I'm a MEGA BOT");
        }
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            await turnContext.sendActivity(`You said '${ turnContext.activity.text }'`);
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
    }
}



const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_NAME_PROP = 'user_name';
const WHO_ARE_YOU = 'who_are_you';
const HELLO_USER = 'hello_user';

const NAME_PROMPT = 'name_prompt';

class SimplePromptBot {
    /**
     *
     * @param {Object} conversationState
     * @param {Object} userState
     */
    constructor(conversationState, userState) {
        // creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this.conversationState = conversationState;
        this.userState = userState;

        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);

        this.userName = this.userState.createProperty(USER_NAME_PROP);

        this.dialogs = new DialogSet(this.dialogState);

        // Add prompts
        this.dialogs.add(new TextPrompt(NAME_PROMPT));

        // Create a dialog that asks the user for their name.
        this.dialogs.add(new WaterfallDialog(WHO_ARE_YOU, [
            this.askForName.bind(this),
            this.collectAndDisplayName.bind(this)
        ]));

        // Create a dialog that displays a user name after it has been collected.
        this.dialogs.add(new WaterfallDialog(HELLO_USER, [
            this.displayName.bind(this)
        ]));
    }

    // The first step in this waterfall asks the user for their name.
    async askForName(dc) {
        await dc.prompt(NAME_PROMPT, `What is your name, human?`);
    }

    // The second step in this waterfall collects the response, stores it in
    // the state accessor, then displays it.
    async collectAndDisplayName(step) {
        await this.userName.set(step.context, step.result);
        await step.context.sendActivity(`Got it. You are ${ step.result }.`);
        await step.endDialog();
    }

    // This step loads the user's name from state and displays it.
    async displayName(step) {
        const userName = await this.userName.get(step.context, null);
        await step.context.sendActivity(`Your name is ${ userName }.`);
        await step.endDialog();
    }

    /**
     *
     * @param {Object} context on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Create dialog context
            const dc = await this.dialogs.createContext(turnContext);

            // Continue the current dialog
            if (!turnContext.responded) {
                await dc.continueDialog();
            }

            // Show menu if no response sent
            if (!turnContext.responded) {
                const userName = await this.userName.get(dc.context, null);
                if (userName) {
                    await dc.beginDialog(HELLO_USER);
                } else {
                    await dc.beginDialog(WHO_ARE_YOU);
                }
            }
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            // Do we have any new members added to the conversation?
            if (turnContext.activity.membersAdded.length !== 0) {
                // Iterate over all new members added to the conversation
                for (let idx in turnContext.activity.membersAdded) {
                    // Greet anyone that was not the target (recipient) of this message.
                    // Since the bot is the recipient for events from the channel,
                    // context.activity.membersAdded === context.activity.recipient.Id indicates the
                    // bot was added to the conversation, and the opposite indicates this is a user.
                    if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                        // Send a "this is what the bot does" message to this user.
                        await turnContext.sendActivity('I am a bot that demonstrates the TextPrompt class to collect your name, store it in UserState, and display it. Say anything to continue.');
                    }
                }
            }
        }

        // Save changes to the user name.
        await this.userState.saveChanges(turnContext);

        // End this turn by saving changes to the conversation state.
        await this.conversationState.saveChanges(turnContext);
    }
}



const METHOD_PROMPT = 'method_prompt';
const BEGIN = 'begin';


class DeterminatorBot {
    constructor(conversationState) {
        // creates a new state accessor property.
        this.conversationState = conversationState;

        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);

        this.dialogs = new DialogSet(this.dialogState);

        // Add prompts
        this.dialogs.add(new TextPrompt(METHOD_PROMPT));
        

        // TODO: Change this to Determinator dialog
        this.dialogs.add(new WaterfallDialog(BEGIN, [
            this.askForMethod.bind(this)
        ]));

        //this.dialogs.add(new WaterfallDialog(HELLO_USER, [
            //this.displayName.bind(this)
        //]));
    }

    // The first step in this waterfall asks the user for the prediction
    // method: Flip a coin or enchanted octaball.
    // TODO: Give the user a list of options to choose from
    async askForMethod(dc) {
        await dc.prompt(METHOD_PROMPT, `Choose a prediction method:`);
    }

    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            await turnContext.sendActivity("Welcome to **Determinator**. The most *predictible* way to determine your future...");
        } else if (turnContext.activity.type === ActivityTypes.Message) {
            // Create dialog context
            const dc = await this.dialogs.createContext(turnContext);

            // Continue the current dialog
            if (!turnContext.responded) {
                await dc.continueDialog();
            }

            console.log(turnContext.responded);
            await dc.beginDialog(BEGIN);
        }
        // End this turn by saving changes to the conversation state.
        await this.conversationState.saveChanges(turnContext);
    }
    
}


//module.exports.EchoBot = EchoBot;
//module.exports.SimplePromptBot = SimplePromptBot;
module.exports.DeterminatorBot = DeterminatorBot;
