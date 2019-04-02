const { BotFrameworkAdapter, MemoryStorage } = require('botbuilder');
const restify = require('restify');
const { ActivityTypes } = require('botbuilder');

const inMemoryStorage = new MemoryStorage();

class EchoBot {
    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            await turnContext.sendActivity(`You said '${ turnContext.activity.text }'`);
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
    }
}

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
});

const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppID,
    appPassword: process.env.MicrosoftAppPassword
});

const bot = new EchoBot();

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // route to main dialog.
        await bot.onTurn(context);
    });
});

