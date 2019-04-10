import { TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState, UserState } from 'botbuilder';
import { DialogTurnResult, ChoicePrompt, DialogSet, WaterfallDialog, NumberPrompt, TextPrompt, WaterfallStepContext } from 'botbuilder-dialogs';

const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'userProfile';

// Dialog contexts
const WHO_ARE_YOU = 'who_are_you';
const HELLO_USER = 'hello_user';

const NAME_PROMPT = 'name_prompt';
const CONFIRM_PROMPT = 'confirm_prompt';
const AGE_PROMPT = 'age_prompt';

interface IUserData {
    name? : string,
    age? : number
};

export class SequentialBot {
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
        this.dialogs.add(new TextPrompt(NAME_PROMPT));
        this.dialogs.add(new ChoicePrompt(CONFIRM_PROMPT));
        this.dialogs.add(new NumberPrompt(AGE_PROMPT, async (prompt) => {
            if (prompt.recognized.succeeded) {
                if (prompt.recognized.value && prompt.recognized.value <= 0) {
                    await prompt.context.sendActivity(`Your age can't be less than zero.`);
                    return false;
                } else {
                    return true;
                }
            }
            return false;
        }));

        const whoAreYou : ((sc: WaterfallStepContext<IUserData>) => Promise<DialogTurnResult<any>>)[] = [
            this.promptForName.bind(this),
            this.confirmAgePrompt.bind(this),
            this.promptForAge.bind(this),
            this.captureAge.bind(this)
        ];
        // Create a dialog that asks the user for their name.
        this.dialogs.add(new WaterfallDialog(WHO_ARE_YOU, whoAreYou));

        // Create a dialog that displays a user name after it has been collected.
        this.dialogs.add(new WaterfallDialog(HELLO_USER, [
            this.displayProfile.bind(this)
        ]));
    }

    // This step in the dialog prompts the user for their name.
    async promptForName(step: WaterfallStepContext<IUserData>) {
        return await step.prompt(NAME_PROMPT, `What is your name, human?`);
    }

    // This step captures the user's name, then prompts whether or not to collect an age.
    async confirmAgePrompt(step: WaterfallStepContext) {
        const userData : IUserData = { name: '', age : 0 };
        const user = await this.userProfile.get(step.context, userData);
        user.name = step.result;
        await this.userProfile.set(step.context, user);
        return await step.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no']);
    }

    // This step checks the user's response - if yes, the bot will proceed to prompt for age.
    // Otherwise, the bot will skip the age step.
    async promptForAge(step: WaterfallStepContext) {
        if (step.result && step.result.value === 'yes') {
            return await step.prompt(AGE_PROMPT, `What is your age?`,
                //{
                    //retryPrompt: 'Sorry, please specify your age as a positive number or say cancel.'
                //}
            );
        } else {
            return await step.next(-1);
        }
    }

    // This step captures the user's age.
    async captureAge(step: WaterfallStepContext) {
        const userData : IUserData = { name: '', age : 0 };
        const user = await this.userProfile.get(step.context, userData );
        if (step.result !== -1) {
            user.age = step.result;
            await this.userProfile.set(step.context, user);
            await step.context.sendActivity(`I will remember that you are ${ step.result } years old.`);
        } else {
            await step.context.sendActivity(`No age given.`);
        }
        return await step.endDialog();
    }

    // This step displays the captured information back to the user.
    async displayProfile(step: WaterfallStepContext) {
        const user = await this.userProfile.get(step.context, {});
        if (user.age) {
            await step.context.sendActivity(`Your name is ${ user.name } and you are ${ user.age } years old.`);
        } else {
            await step.context.sendActivity(`Your name is ${ user.name } and you did not share your age.`);
        }
        return await step.endDialog();
    }


    async onTurn(context : TurnContext) {
        if (context.activity.type === ActivityTypes.Message) {
            const dc = await this.dialogs.createContext(context);

            //const utterance = (context.activity.text || '').trim().toLowerCase();

            // If the bot has not yet responded, continue processing the current
            // dialog.
            await dc.continueDialog();

            // Start the sample dialog in response to any other input.
            if(!context.responded) {
                const user = await this.userProfile.get(dc.context, {});
                if (user.name) {
                    await dc.beginDialog(HELLO_USER);
                } else {
                    await dc.beginDialog(WHO_ARE_YOU);
                }
            }
        }

        // Save changes to the user state.
        await this.userState.saveChanges(context);

        // End this turn by saving changes to the conversation state.
        await this.conversationState.saveChanges(context);
    }
}
