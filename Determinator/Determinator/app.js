const { ActivityTypes, BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { DialogSet } = require('botbuilder-dialogs');
const restify = require('restify');
const { EchoBot } = require('./bot.js');


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

