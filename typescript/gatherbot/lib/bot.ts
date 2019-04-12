import { TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState } from 'botbuilder';
import { DateTimePrompt, DialogTurnResult, ChoicePrompt, DialogSet, WaterfallDialog, NumberPrompt, WaterfallStepContext } from 'botbuilder-dialogs';
//
// Define identifiers for our state property accessors.
const DIALOG_STATE_ACCESSOR = 'dialogStateAccessor';
const RESERVATION_ACCESSOR = 'reservationAccessor';

// Define identifiers for our dialogs and prompts.
const RESERVATION_DIALOG = 'reservationDialog';
const SIZE_RANGE_PROMPT = 'rangePrompt';
const LOCATION_PROMPT = 'locationPrompt';
const RESERVATION_DATE_PROMPT = 'reservationDatePrompt';

interface IUserData {
    name? : string,
    age? : number
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

        const reservations : ((sc: WaterfallStepContext<IUserData>) => Promise<DialogTurnResult<any>>)[] = [
            this.promptForPartySize.bind(this),
            //this.promptForLocation.bind(this),
            //this.promptForReservationDate.bind(this),
            //this.acknowledgeReservation.bind(this),
        ];

        this.dialogSet.add(new WaterfallDialog(RESERVATION_DIALOG, reservations));
    }

    private async promptForPartySize(step: WaterfallStepContext<{}>) : Promise<DialogTurnResult<any>> {
        return step.endDialog();
    }

    async onTurn(context : TurnContext) {
    }
}
