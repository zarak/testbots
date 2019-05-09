"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const checkInDialog_1 = require("./checkInDialog");
const reserveTableDialog_1 = require("./reserveTableDialog");
const setAlarmDialog_1 = require("./setAlarmDialog");
const authDialog_1 = require("./authDialog");
// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
const USER_INFO_PROPERTY = 'userInfoProperty';
class AuthBot {
    constructor(conversationState, userState) {
        this.conversationState = conversationState;
        this.userState = userState;
        // Create a new state accessor property.
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userInfoAccessor = this.userState.createProperty(USER_INFO_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogStateAccessor);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogStateAccessor)
            .add(new authDialog_1.AuthenticationDialog('authenticationDialog', this.userInfoAccessor))
            //.add(new OAuthPrompt('signOut', {connectionName: 'test', title: 'Sign Out'}))
            .add(new checkInDialog_1.CheckInDialog('checkInDialog', this.userInfoAccessor))
            .add(new reserveTableDialog_1.ReserveTableDialog('reserveTableDialog', this.userInfoAccessor))
            .add(new setAlarmDialog_1.SetAlarmDialog('setAlarmDialog', this.userInfoAccessor))
            .add(new botbuilder_dialogs_1.WaterfallDialog('mainDialog', [
            //this.loginPrompt.bind(this),
            this.promptForChoice.bind(this),
            this.startChildDialog.bind(this),
            this.saveResult.bind(this)
        ]))
            .add(new botbuilder_dialogs_1.WaterfallDialog('reserveTableAuth', [
            this.loginPrompt.bind(this),
            this.reserveTable.bind(this)
        ]));
    }
    loginPrompt(step) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield step.beginDialog('authenticationDialog');
        });
    }
    reserveTable(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userInfoAccessor.get(step.context);
            return yield step.beginDialog('reserveTableDialog', user);
        });
    }
    promptForChoice(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const menu = ["Reserve Table", "Wake Up"];
            yield step.context.sendActivity(botbuilder_1.MessageFactory.suggestedActions(menu, 'How can I help you?'));
            return botbuilder_dialogs_1.Dialog.EndOfTurn;
        });
    }
    startChildDialog(step) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the user's info.
            const user = yield this.userInfoAccessor.get(step.context);
            // Check the user's input and decide which dialog to start.
            // Pass in the guest info when starting either of the child dialogs.
            switch (step.result) {
                case "Reserve Table":
                    //return await step.beginDialog('reserveTableDialog', user.guestInfo);
                    return yield step.beginDialog('reserveTableAuth', user);
                    break;
                case "Wake Up":
                    return yield step.beginDialog('setAlarmDialog', user.guestInfo);
                    break;
                default:
                    yield step.context.sendActivity("Sorry, I don't understand that command. Please choose an option from the list.");
                    return yield step.replaceDialog('mainDialog');
                    break;
            }
        });
    }
    saveResult(step) {
        return __awaiter(this, void 0, void 0, function* () {
            // Process the return value from the child dialog.
            if (step.result) {
                const user = yield this.userInfoAccessor.get(step.context);
                if (step.result.table) {
                    // Store the results of the reserve-table dialog.
                    user.table = step.result.table;
                }
                else if (step.result.alarm) {
                    // Store the results of the set-wake-up-call dialog.
                    user.alarm = step.result.alarm;
                }
                yield this.userInfoAccessor.set(step.context, user);
            }
            // Restart the main menu dialog.
            return yield step.replaceDialog('mainDialog'); // Show the menu again
        });
    }
    onTurn(turnContext) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(turnContext);
            if (turnContext.activity.type === botbuilder_1.ActivityTypes.Message) {
                const user = yield this.userInfoAccessor.get(turnContext, {});
                const dc = yield this.dialogs.createContext(turnContext);
                const dialogTurnResult = yield dc.continueDialog();
                const text = turnContext.activity.text;
                console.log("Dialog", dialogTurnResult);
                console.log("User", user);
                //if (dialogTurnResult.status === DialogTurnStatus.empty) {
                //await dc.beginDialog('authenticationDialog');
                //}
                if (text === 'login') {
                    yield dc.cancelAllDialogs();
                    yield dc.beginDialog('authenticationDialog');
                }
                if (text === 'logout') {
                    const prompt = new botbuilder_dialogs_1.OAuthPrompt('signOut', { connectionName: 'test', title: 'Sign Out' });
                    turnContext.sendActivity(`You have been logged out`);
                    yield prompt.signOutUser(turnContext);
                }
                if (dialogTurnResult.status === botbuilder_dialogs_1.DialogTurnStatus.complete) {
                    // If user is coming from login dialog then
                    // dialogTurnResult.result will be null, so go to check-in
                    if (!dialogTurnResult.result) {
                        yield dc.beginDialog('checkInDialog');
                    }
                    else {
                        user.name = dialogTurnResult.result.name;
                        user.roomNumber = dialogTurnResult.result.roomNumber;
                        yield this.userInfoAccessor.set(turnContext, user);
                        yield dc.beginDialog('mainDialog');
                    }
                }
                else if (!turnContext.responded) {
                    // If name hasn't been set, then do checkin to get name and
                    // room number
                    if (!user.name) {
                        yield dc.beginDialog('checkInDialog');
                    }
                    else {
                        yield dc.beginDialog('mainDialog');
                    }
                }
                // Save state changes
                yield this.conversationState.saveChanges(turnContext);
                yield this.userState.saveChanges(turnContext);
            }
        });
    }
}
exports.AuthBot = AuthBot;
//# sourceMappingURL=bot.js.map