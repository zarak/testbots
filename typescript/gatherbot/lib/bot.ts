import { UserState, TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState } from 'botbuilder';
import { DialogTurnStatus, DateTimePrompt, DialogTurnResult, ChoicePrompt, DialogSet, WaterfallDialog, NumberPrompt, WaterfallStepContext } from 'botbuilder-dialogs';

// Define identifiers for our state property accessors.
const DIALOG_STATE_ACCESSOR = 'dialogStateAccessor';
const RESERVATION_ACCESSOR = 'reservationAccessor';

// Define identifiers for our dialogs and prompts.
const RESERVATION_DIALOG = 'reservationDialog';
const SIZE_RANGE_PROMPT = 'rangePrompt';
const LOCATION_PROMPT = 'locationPrompt';
const RESERVATION_DATE_PROMPT = 'reservationDatePrompt';

interface IReservationData {
    size? : number,
    location? : string,
    date? : object
};

export class GatherBot {
    private dialogStateAccessor : StatePropertyAccessor;
    private reservationAccessor : StatePropertyAccessor;
    private dialogSet : DialogSet;

    constructor(private conversationState: ConversationState) {
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_ACCESSOR);
        this.reservationAccessor = this.conversationState.createProperty(RESERVATION_ACCESSOR);

        this.dialogSet = new DialogSet(this.dialogStateAccessor);
        this.dialogSet.add(new NumberPrompt(SIZE_RANGE_PROMPT));
        this.dialogSet.add(new ChoicePrompt(LOCATION_PROMPT));
        this.dialogSet.add(new DateTimePrompt(RESERVATION_DATE_PROMPT));

        const reservations : ((sc: WaterfallStepContext<IReservationData>) => Promise<DialogTurnResult<any>>)[] = [
            this.promptForPartySize.bind(this),
            this.promptForLocation.bind(this),
            //this.promptForReservationDate.bind(this),
            //this.acknowledgeReservation.bind(this),
        ];

        this.dialogSet.add(new WaterfallDialog(RESERVATION_DIALOG, reservations));
    }

    private async promptForPartySize(step: WaterfallStepContext<IReservationData>) : Promise<DialogTurnResult<any>> {
        return await step.prompt(
            SIZE_RANGE_PROMPT, {
                prompt: 'How many people is the reservation for?',
                retryPrompt: 'How large is your party?',
                validations: { min: 3, max: 8 },
            });
    }

    private async promptForLocation(step: WaterfallStepContext<IReservationData>) : Promise<DialogTurnResult<any>> {
        const resData : IReservationData = { size: step.result, location: '', date: {} };
        await this.reservationAccessor.set(step.context, resData);
        console.log(await this.reservationAccessor.get(step.context, resData));
        return await step.prompt(
            LOCATION_PROMPT, {
                prompt: "Please choose a location",
                retryPrompt: 'Sorry, please choose a location from the list.',
                choices: ['Redmond', 'Bellevue', 'Seattle'],
        });
    }

    async onTurn(context : TurnContext) {
        switch (context.activity.type) {
            case ActivityTypes.Message:
                const reservation = await this.reservationAccessor.get(context, null);

                const dc = await this.dialogSet.createContext(context);

                if (!dc.activeDialog) {
                    if (!reservation) {
                        await dc.beginDialog(RESERVATION_DIALOG);
                    } else {
                        await context.sendActivity(`We'll see you on ${reservation}`);
                    }
                }

                else {
                    const dialogTurnResult = await dc.continueDialog();
                    console.log(dialogTurnResult);

                    if (dialogTurnResult.status === DialogTurnStatus.complete) {
                        await this.reservationAccessor.set(
                            context,
                            dialogTurnResult.result);

                        await context.sendActivity(
                            `Your party of ${dialogTurnResult.result.size} is ` +
                            `confirmed for ${dialogTurnResult.result.date} in ` +
                            `${dialogTurnResult.result.location}.`);
                    }
                }

                await this.conversationState.saveChanges(context, false);
                break;
            default:
                break;
        }
    }
}
