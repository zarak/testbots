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
        this.dialogStateAccessor = conversationState.createProperty(DIALOG_STATE_ACCESSOR);
        this.reservationAccessor = conversationState.createProperty(RESERVATION_ACCESSOR);

        this.dialogSet = new DialogSet(this.dialogStateAccessor);
        this.dialogSet.add(new NumberPrompt(SIZE_RANGE_PROMPT, this.rangeValidator));
        this.dialogSet.add(new ChoicePrompt(LOCATION_PROMPT));
        this.dialogSet.add(new DateTimePrompt(RESERVATION_DATE_PROMPT, this.dateValidator));

        const whoAreYou : ((sc: WaterfallStepContext<IUserData>) => Promise<DialogTurnResult<any>>)[] = [
            this.promptForName.bind(this),
            this.confirmAgePrompt.bind(this),
            this.promptForAge.bind(this),
            this.captureAge.bind(this)
        ];

        this.dialogSet.add(new WaterfallDialog(RESERVATION_DIALOG, [
            this.promptForPartySize.bind(this),
            this.promptForLocation.bind(this),
            this.promptForReservationDate.bind(this),
            this.acknowledgeReservation.bind(this),
        ]));
    }

    async rangeValidator(promptContext: WaterfallStepContext) {
		// Check whether the input could be recognized as an integer.
		if (!promptContext.recognized.succeeded) {
			await promptContext.context.sendActivity(
				"I'm sorry, I do not understand. Please enter the number of people in your party.");
			return false;
		}
		else if (promptContext.recognized.value % 1 != 0) {
			await promptContext.context.sendActivity(
				"I'm sorry, I don't understand fractional people.");
			return false;
		}

		// Check whether the party size is appropriate.
		var size = promptContext.recognized.value;
		if (size < promptContext.options.validations.min
			|| size > promptContext.options.validations.max) {
			await promptContext.context.sendActivity(
				'Sorry, we can only take reservations for parties of '
				+ `${promptContext.options.validations.min} to `
				+ `${promptContext.options.validations.max}.`);
			await promptContext.context.sendActivity(promptContext.options.retryPrompt);
			return false;
		}

		return true;
	}

    async onTurn(context : TurnContext) {
    }
}
