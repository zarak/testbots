import { MessageFactory, UserState, TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState } from 'botbuilder';
import { Dialog, DialogTurnStatus, DialogTurnResult, TextPrompt, ChoicePrompt, DialogSet, WaterfallDialog, NumberPrompt, WaterfallStepContext } from 'botbuilder-dialogs';
import { IUserInfo } from './userInfoState';
import { CheckInDialog } from './checkInDialog';
import { ReserveTableDialog } from './reserveTableDialog';
import { SetAlarmDialog } from './setAlarmDialog';

// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
const USER_INFO_PROPERTY = 'userInfoProperty';

export class ComponentBot {
    /**
     *
     * @param {ConversationState} conversation state object
     * @param {UserState} user state object
     */
    private dialogStateAccessor : StatePropertyAccessor;
    private userInfoAccessor : StatePropertyAccessor;
    private dialogs: DialogSet;

    constructor(private conversationState: ConversationState, private userState: UserState) {
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userInfoAccessor = this.userState.createProperty(USER_INFO_PROPERTY);

        //const toplevel : ((sc: WaterfallStepContext<IUserInfo>) => Promise<DialogTurnResult<any>>)[] = [
        //];

        // Create our bot's dialog set, adding a main dialog and the three component dialogs.
        this.dialogs = new DialogSet(this.dialogStateAccessor)
            .add(new CheckInDialog('checkInDialog', this.userInfoAccessor))
            .add(new ReserveTableDialog('reserveTableDialog', this.userInfoAccessor))
            .add(new SetAlarmDialog('setAlarmDialog', this.userInfoAccessor))
            .add(new WaterfallDialog('mainDialog', [
                this.promptForChoice.bind(this),
                this.startChildDialog.bind(this),
                this.saveResult.bind(this)
        ]));

    }

    async promptForChoice(step: WaterfallStepContext) {
        const menu = ["Reserve Table", "Wake Up"];
        await step.context.sendActivity(MessageFactory.suggestedActions(menu, 'How can I help you?'));
        return Dialog.EndOfTurn;
    }

    async startChildDialog(step: WaterfallStepContext) {
        // Get the user's info.
        const user = await this.userInfoAccessor.get(step.context);
        // Check the user's input and decide which dialog to start.
        // Pass in the guest info when starting either of the child dialogs.
        switch (step.result) {
            case "Reserve Table":
                return await step.beginDialog('reserveTableDialog', user.guestInfo);
                break;
            case "Wake Up":
                return await step.beginDialog('setAlarmDialog', user.guestInfo);
                break;
            default:
                await step.context.sendActivity("Sorry, I don't understand that command. Please choose an option from the list.");
                return await step.replaceDialog('mainDialog');
                break;
        }
    }

    async saveResult(step: WaterfallStepContext) {
        // Process the return value from the child dialog.
        if (step.result) {
            const user = await this.userInfoAccessor.get(step.context);
            if (step.result.table) {
                // Store the results of the reserve-table dialog.
                user.table = step.result.table;
            } else if (step.result.alarm) {
                // Store the results of the set-wake-up-call dialog.
                user.alarm = step.result.alarm;
            }
            await this.userInfoAccessor.set(step.context, user);
        }
        // Restart the main menu dialog.
        return await step.replaceDialog('mainDialog'); // Show the menu again
    }

    async onTurn(turnContext: TurnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            const user = await this.userInfoAccessor.get(turnContext, {});
            const dc = await this.dialogs.createContext(turnContext);
            const dialogTurnResult = await dc.continueDialog();
            if (dialogTurnResult.status === DialogTurnStatus.complete) {
                user.guestInfo = dialogTurnResult.result;
                await this.userInfoAccessor.set(turnContext, user);
                await dc.beginDialog('mainDialog');
            } else if (!turnContext.responded) {
                if (!user.guestInfo) {
                    await dc.beginDialog('checkInDialog');
                } else {
                    await dc.beginDialog('mainDialog');
                }
            }
            // Save state changes
            await this.conversationState.saveChanges(turnContext);
            await this.userState.saveChanges(turnContext);
        }
    }
}
