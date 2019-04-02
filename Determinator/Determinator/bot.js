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
