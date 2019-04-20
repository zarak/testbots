import { UserState, TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState } from 'botbuilder';
import { DialogTurnStatus, DialogTurnResult, TextPrompt, ChoicePrompt, DialogSet, WaterfallDialog, NumberPrompt, WaterfallStepContext } from 'botbuilder-dialogs';

// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
const USER_PROFILE_PROPERTY = 'userProfileProperty';

const TOP_LEVEL_DIALOG = 'dialog-topLevel';
const NAME_PROMPT = 'prompt-name';
const AGE_PROMPT = 'prompt-age';
const SELECTION_PROMPT = 'prompt-companySelection';

interface IUserData {
    name? : string,
    age? : number,
    company? : string
};

export class ComplexBot {
    private dialogStateAccessor : StatePropertyAccessor;
    private dialogs : DialogSet;
    private userProfileAccessor : StatePropertyAccessor;

    constructor(private conversationState: ConversationState, private userState: UserState) {
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userProfileAccessor = this.userState.createProperty(USER_PROFILE_PROPERTY);

        this.dialogs = new DialogSet(this.dialogStateAccessor);

        this.dialogs
            .add(new TextPrompt(NAME_PROMPT))
            .add(new NumberPrompt(AGE_PROMPT))
            .add(new ChoicePrompt(SELECTION_PROMPT));


        const toplevel : ((sc: WaterfallStepContext<IUserData>) => Promise<DialogTurnResult<any>>)[] = [
            this.nameStep.bind(this),
            this.ageStep.bind(this),
            this.startSelectionStep.bind(this),
            this.acknowledgementStep.bind(this),
        ];

        this.dialogs.add(new WaterfallDialog(TOP_LEVEL_DIALOG, toplevel));
    }

    private async nameStep(step: WaterfallStepContext) {
        //const userData : IUserData = {
            //name: '',
            //age: 0,
            //company: '',
        //};
        //await this.userProfileAccessor.set(step.context, userData);

        return await step.prompt(NAME_PROMPT, "Please enter your name.");
    }

    private async ageStep(step: WaterfallStepContext) {
        const userData : IUserData = await this.userProfileAccessor.get(step.context);
        userData.name = step.result;
        console.log("NAME", step.result);
        await this.userProfileAccessor.set(step.context, userData);
        console.log(await this.userProfileAccessor.get(step.context));

        return await step.prompt(AGE_PROMPT, "Please enter your age.");
    }

    private async startSelectionStep(step: WaterfallStepContext) {
        const userData : IUserData = await this.userProfileAccessor.get(step.context);
        userData.age = step.result;
        await this.userProfileAccessor.set(step.context, userData);
        const age = step.result;
        if (age < 20) {
            await step.context.sendActivity("Oh noes lel");
        } else {
            await step.context.sendActivity("It's all good homie");
        }
        return await step.next();
    }

    private async acknowledgementStep(step: WaterfallStepContext) {
        console.log(await this.userProfileAccessor.get(step.context));

        return await step.endDialog();
    }

    async onTurn(context: TurnContext) {
        if (context.activity.type === ActivityTypes.Message) {
            const dc = await this.dialogs.createContext(context);
            const results = await dc.continueDialog();
            let userData : IUserData;

            switch (results.status) {
                case DialogTurnStatus.cancelled:
                case DialogTurnStatus.empty:
                    // If there is no active dialog, we should clear the user info and start a new dialog.
                    const emptyUserData : IUserData = {
                        name: '',
                        age: 0,
                        company: '',
                    };
                    await this.userProfileAccessor.set(context, emptyUserData);
                    await this.userState.saveChanges(context);
                    await dc.beginDialog(TOP_LEVEL_DIALOG);
                    break;
                case DialogTurnStatus.complete:
                    userData  = await this.userProfileAccessor.get(context);
                    await this.userProfileAccessor.set(context, userData);
                    await this.userState.saveChanges(context);
                    console.log("Complete", userData);
                    break;
                case DialogTurnStatus.waiting:
                    // Need to persist data at each step
                    userData = await this.userProfileAccessor.get(context);
                    await this.userProfileAccessor.set(context, userData);
                    await this.userState.saveChanges(context);
                    break;
            }
            
            await this.conversationState.saveChanges(context);
        }
    }
}
