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
    date? : string
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
            this.promptForReservationDate.bind(this),
            this.acknowledgeReservation.bind(this),
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
        const resData : IReservationData = { size: step.result, location: '', date: '' };
        await this.reservationAccessor.set(step.context, resData);
        console.log(await this.reservationAccessor.get(step.context, resData));
        return await step.prompt(
            LOCATION_PROMPT, {
                prompt: "Please choose a location",
                retryPrompt: 'Sorry, please choose a location from the list.',
                choices: ['Redmond', 'Bellevue', 'Seattle'],
        });
    }

    private async promptForReservationDate(step: WaterfallStepContext<IReservationData>) {
        // Record the location information in the current dialog state.
        const resData = await this.reservationAccessor.get(step.context);
        resData.location = step.result.value; // use value field for text prompt
        await this.reservationAccessor.set(step.context, resData);
        console.log(await this.reservationAccessor.get(step.context, resData));

        return await step.prompt(
            RESERVATION_DATE_PROMPT, {
                prompt: 'Great. When will the reservation be for?',
                retryPrompt: 'What time should we make your reservation for?'
            });
    }

    async acknowledgeReservation(step: WaterfallStepContext) {
        // Retrieve the reservation date.
        const resolution = step.result[0];
        const time = resolution.value || resolution.start;

        // Send an acknowledgement to the user.
        await step.context.sendActivity(
            'Thank you. We will confirm your reservation shortly.');

        const resData = await this.reservationAccessor.get(step.context);
        resData.date = time;
        await this.reservationAccessor.set(step.context, resData);
        console.log(await this.reservationAccessor.get(step.context, resData));
        // Return the collected information to the parent context.
        return await step.endDialog(resData);
    }

    async onTurn(context: TurnContext) {
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
                    const resData = await this.reservationAccessor.get(context);

                    if (dialogTurnResult.status === DialogTurnStatus.complete) {
                        await this.reservationAccessor.set(
                            context,
                            resData);

                        await context.sendActivity(
                            `Your party of ${resData.size} is ` +
                            `confirmed for ${resData.date} in ` +
                            `${resData.location}.`);
                    }
                }

                await this.conversationState.saveChanges(context, false);
                break;
            default:
                break;
        }
    }
}
