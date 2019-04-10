import { TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState, UserState } from 'botbuilder';
import { DialogTurnResult, DialogSet, WaterfallDialog, TextPrompt, WaterfallStepContext } from 'botbuilder-dialogs';

const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'userProfile';

// Dialog contexts
const ROOT = 'root';

const NAME_PROMPT = 'name_prompt';

interface IUserData {
    name?: string | null
}

export class PromptBot {
    private dialogState : StatePropertyAccessor;
    // These are automatically initialized
    //private conversationState : ConversationState;
    //private userState : UserState;
    private userProfile : StatePropertyAccessor;
    private dialogs : DialogSet;

    constructor(private conversationState: ConversationState, private userState: UserState) {
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userProfile = this.userState.createProperty(USER_PROFILE_PROPERTY);

        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new TextPrompt(NAME_PROMPT)); // TextPrompt returns a string

        // Create a dialog that asks the user for their name.
        const onboarding: ((sc: WaterfallStepContext<IUserData>) => Promise<DialogTurnResult<any>>)[]  =
        [
            this.promptForName.bind(this),
            this.displayName.bind(this)
        ];

        this.dialogs.add(new WaterfallDialog(ROOT, onboarding));
    }

    // This step in the dialog prompts the user for their name.
    public async promptForName(step: WaterfallStepContext<IUserData>): Promise<DialogTurnResult> {
        return await step.prompt(NAME_PROMPT, `What is your name, human?`);
    }

    public async displayName(step: WaterfallStepContext) {
        const userData : IUserData = { name : '' };
        const user = await this.userProfile.get(step.context, userData);
        user.name = step.result;
        await this.userProfile.set(step.context, user);
        console.log(user.name);
        return step.endDialog();
    }

    async onTurn(context : TurnContext) {
        if (context.activity.type === ActivityTypes.Message) {
            const dc = await this.dialogs.createContext(context);

            const utterance = (context.activity.text || '').trim().toLowerCase();

            // If the bot has not yet responded, continue processing the current
            // dialog.
            await dc.continueDialog();

            // Start the sample dialog in response to any other input.
            if(!context.responded) {
                const user = await this.userProfile.get(dc.context, {});
                if (user.name) {
                    await context.sendActivity(`Hello ${user.name}`);
                    await dc.endDialog();
                } else {
                    await dc.beginDialog(ROOT);
                }
            }
        }

        // Save changes to the user state.
        await this.userState.saveChanges(context);

        // End this turn by saving changes to the conversation state.
        await this.conversationState.saveChanges(context);
    }
}
