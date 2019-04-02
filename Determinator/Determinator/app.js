const { ActivityTypes, BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { DialogSet } = require('botbuilder-dialogs');
const restify = require('restify');

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

const inMemoryStorage = new MemoryStorage();
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppID,
    appPassword: process.env.MicrosoftAppPassword
});

const bot = new EchoBot();

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
});

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // route to main dialog.
        await bot.onTurn(context);
    });
});

