const { DialogSet } = require('botbuilder-dialogs');
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

module.exports.EchoBot = EchoBot;
