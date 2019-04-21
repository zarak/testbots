import { TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState } from 'botbuilder';
import { DialogTurnStatus, DialogTurnResult, TextPrompt, ChoicePrompt, DialogSet, WaterfallDialog, NumberPrompt, WaterfallStepContext } from 'botbuilder-dialogs';

// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';

const TOP_LEVEL_DIALOG = 'dialog-topLevel';
const NAME_PROMPT = 'prompt-name';
const AGE_PROMPT = 'prompt-age';
const SELECTION_PROMPT = 'prompt-companySelection';

interface IUserData {
    name? : string,
    age? : number,
    company? : string
};

// Define the company choices for the company selection prompt.
const COMPANY_OPTIONS = [
    'Adatum Corporation', 'Contoso Suites', 'Graphic Design Institute', 'Wide World Importers'
];

export class InterruptBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    private dialogStateAccessor: StatePropertyAccessor;
    private dialogs: DialogSet;

    constructor(private conversationState: ConversationState) {
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);

        this.dialogs = new DialogSet(this.dialogStateAccessor);

        this.dialogs
            .add(new TextPrompt(NAME_PROMPT))
            .add(new NumberPrompt(AGE_PROMPT))
            .add(new ChoicePrompt(SELECTION_PROMPT));

        const toplevel : ((sc: WaterfallStepContext<IUserData>) => Promise<DialogTurnResult<any>>)[] = [
        ];

        this.dialogs.add(new WaterfallDialog(TOP_LEVEL_DIALOG, toplevel));
    }

    async onTurn(context: TurnContext) {
        if (context.activity.type === ActivityTypes.Message) {
            const dc = await this.dialogs.createContext(context);
            const results = await dc.continueDialog();
            
            await this.conversationState.saveChanges(context);
        }
    }
}
