import { UserState, TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState } from 'botbuilder';
import { DialogTurnStatus, DateTimePrompt, DialogTurnResult, ChoicePrompt, DialogSet, WaterfallDialog, NumberPrompt, WaterfallStepContext } from 'botbuilder-dialogs';


interface IReservationData {
    size? : number,
    location? : string,
    date? : string
};

export class ComplexBot {
    private dialogStateAccessor : StatePropertyAccessor;
    private dialogSet : DialogSet;

    constructor(private conversationState: ConversationState, private userState: UserState) {
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_ACCESSOR);

        this.dialogSet = new DialogSet(this.dialogStateAccessor);

        //const reservations : ((sc: WaterfallStepContext<IReservationData>) => Promise<DialogTurnResult<any>>)[] = [
        //];

        //this.dialogSet.add(new WaterfallDialog(RESERVATION_DIALOG, reservations));
    }


    async onTurn(context: TurnContext) {
        switch (context.activity.type) {
            case ActivityTypes.Message:
                const dc = await this.dialogSet.createContext(context);

                if (!dc.activeDialog) {
                }
                
                await this.conversationState.saveChanges(context, false);
                break;
            default:
                break;
        }
    }
}
