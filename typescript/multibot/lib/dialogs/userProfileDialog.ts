// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { TurnContext, StatePropertyAccessor, ConversationState, UserState, ActivityHandler } from 'botbuilder';
import { WaterfallStepContext } from 'botbuilder-dialogs';

import {
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} from 'botbuilder-dialogs';

import { UserProfileInfo } from '../userProfile';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export class UserProfileDialog extends ComponentDialog {
    public userProfile: StatePropertyAccessor;
    constructor(public userState: UserState, private logger: any) {
        super('userProfileDialog');

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.transportStep.bind(this),
            this.nameStep.bind(this),
            this.nameConfirmStep.bind(this),
            this.ageStep.bind(this),
            this.confirmStep.bind(this),
            this.summaryStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext: TurnContext, accessor: StatePropertyAccessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async transportStep(step: WaterfallStepContext) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        // Running a prompt here means the next WaterfallStep will be run when the users response is received.
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter your mode of transport.',
            choices: ChoiceFactory.toChoices(['Car', 'Bus', 'Bicycle'])
        });
    }

    async nameStep(step: WaterfallStepContext) {
        const userProfileInfo = new UserProfileInfo();
        userProfileInfo.transport = step.result.value;
        await this.userProfile.set(step.context, userProfileInfo);
        return await step.prompt(NAME_PROMPT, `What is your name, human?`);
    }

    async nameConfirmStep(step: WaterfallStepContext) {
        //step.values.name = step.result;
        const userProfileInfo: UserProfileInfo = await this.userProfile.get(step.context);
        userProfileInfo.name = step.result;
        await this.userProfile.set(step.context, userProfileInfo);

        // We can send messages to the user at any point in the WaterfallStep.
        await step.context.sendActivity(`Thanks ${ step.result }.`);

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        return await step.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no']);
    }

    async ageStep(step: WaterfallStepContext) {
        if (step.result) {
            // User said "yes" so we will be prompting for the age.
            // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is a Prompt Dialog.
            const promptOptions = { prompt: 'Please enter your age.', retryPrompt: 'The value entered must be greater than 0 and less than 150.' };

            return await step.prompt(NUMBER_PROMPT, promptOptions);
        } else {
            // User said "no" so we will skip the next step. Give -1 as the age.
            return await step.next(-1);
        }
    }

    async confirmStep(step: WaterfallStepContext) {
        const userProfileInfo: UserProfileInfo = await this.userProfile.get(step.context);
        userProfileInfo.age = step.result;
        await this.userProfile.set(step.context, userProfileInfo);

        const msg = step.result.age === -1 ? 'No age given.' : `I have your age as ${ userProfileInfo.age }.`;

        // We can send messages to the user at any point in the WaterfallStep.
        await step.context.sendActivity(msg);

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is a Prompt Dialog.
        return await step.prompt(CONFIRM_PROMPT, { prompt: 'Is this okay?' });
    }

    async summaryStep(step: WaterfallStepContext) {
        if (step.result) {
            // Get the current profile object from user state.
            const userProfile: UserProfileInfo = await this.userProfile.get(step.context, new UserProfileInfo());

            //userProfile.transport = step.values.transport;
            //userProfile.name = step.values.name;
            //userProfile.age = step.values.age;

            let msg = `I have your mode of transport as ${ userProfile.transport } and your name as ${ userProfile.name }.`;
            if (userProfile.age !== -1) {
                msg += ` And age as ${ userProfile.age }.`;
            }

            await step.context.sendActivity(msg);
        } else {
            await step.context.sendActivity('Thanks. Your profile will not be kept.');
        }

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
        return await step.endDialog();
    }

    async agePromptValidator(promptContext: any) {
        // This condition is our validation rule. You can also change the value at this point.
        return promptContext.recognized.succeeded && promptContext.recognized.value > 0 && promptContext.recognized.value < 150;
    }
}
