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
// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
const USER_INFO_PROPERTY = 'userInfoProperty';
class ComponentBot {
    constructor(conversationState, userState) {
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userInfoAccessor = this.userState.createProperty(USER_INFO_PROPERTY);
        //const toplevel : ((sc: WaterfallStepContext<IUserInfo>) => Promise<DialogTurnResult<any>>)[] = [
        //];
        // Create our bot's dialog set, adding a main dialog and the three component dialogs.
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogStateAccessor)
            .add(new checkInDialog_1.CheckInDialog('checkInDialog', this.userInfoAccessor))
            .add(new reserveTableDialog_1.ReserveTableDialog('reserveTableDialog', this.userInfoAccessor))
            .add(new setAlarmDialog_1.SetAlarmDialog('setAlarmDialog', this.userInfoAccessor))
            .add(new botbuilder_dialogs_1.WaterfallDialog('mainDialog', [
            this.promptForChoice.bind(this),
            this.startChildDialog.bind(this),
            this.saveResult.bind(this)
        ]));
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
                    return yield step.beginDialog('reserveTableDialog', user.guestInfo);
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
            if (turnContext.activity.type === botbuilder_1.ActivityTypes.Message) {
                const user = yield this.userInfoAccessor.get(turnContext, {});
                const dc = yield this.dialogs.createContext(turnContext);
                const dialogTurnResult = yield dc.continueDialog();
                if (dialogTurnResult.status === botbuilder_dialogs_1.DialogTurnStatus.complete) {
                    user.guestInfo = dialogTurnResult.result;
                    yield this.userInfoAccessor.set(turnContext, user);
                    yield dc.beginDialog('mainDialog');
                }
                else if (!turnContext.responded) {
                    if (!user.guestInfo) {
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
exports.ComponentBot = ComponentBot;
//# sourceMappingURL=bot.js.map