"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const userProfile_1 = require("../userProfile");
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
class UserProfileDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(userState, logger) {
        super('userProfileDialog');
        this.userState = userState;
        this.logger = logger;
        this.userProfile = userState.createProperty(USER_PROFILE);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(NAME_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(WATERFALL_DIALOG, [
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
    run(turnContext, accessor) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
            dialogSet.add(this);
            const dialogContext = yield dialogSet.createContext(turnContext);
            const results = yield dialogContext.continueDialog();
            if (results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
                yield dialogContext.beginDialog(this.id);
            }
        });
    }
    transportStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
            // Running a prompt here means the next WaterfallStep will be run when the users response is received.
            return yield step.prompt(CHOICE_PROMPT, {
                prompt: 'Please enter your mode of transport.',
                choices: botbuilder_dialogs_1.ChoiceFactory.toChoices(['Car', 'Bus', 'Bicycle'])
            });
        });
    }
    nameStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const userProfileInfo = new userProfile_1.UserProfileInfo();
            userProfileInfo.transport = step.result.value;
            yield this.userProfile.set(step.context, userProfileInfo);
            return yield step.prompt(NAME_PROMPT, `What is your name, human?`);
        });
    }
    nameConfirmStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            //step.values.name = step.result;
            const userProfileInfo = yield this.userProfile.get(step.context);
            userProfileInfo.name = step.result;
            yield this.userProfile.set(step.context, userProfileInfo);
            // We can send messages to the user at any point in the WaterfallStep.
            yield step.context.sendActivity(`Thanks ${step.result}.`);
            // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
            return yield step.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no']);
        });
    }
    ageStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            if (step.result) {
                // User said "yes" so we will be prompting for the age.
                // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is a Prompt Dialog.
                const promptOptions = { prompt: 'Please enter your age.', retryPrompt: 'The value entered must be greater than 0 and less than 150.' };
                return yield step.prompt(NUMBER_PROMPT, promptOptions);
            }
            else {
                // User said "no" so we will skip the next step. Give -1 as the age.
                return yield step.next(-1);
            }
        });
    }
    confirmStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const userProfileInfo = yield this.userProfile.get(step.context);
            userProfileInfo.age = step.result;
            yield this.userProfile.set(step.context, userProfileInfo);
            const msg = step.result.age === -1 ? 'No age given.' : `I have your age as ${userProfileInfo.age}.`;
            // We can send messages to the user at any point in the WaterfallStep.
            yield step.context.sendActivity(msg);
            // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is a Prompt Dialog.
            return yield step.prompt(CONFIRM_PROMPT, { prompt: 'Is this okay?' });
        });
    }
    summaryStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            if (step.result) {
                // Get the current profile object from user state.
                const userProfile = yield this.userProfile.get(step.context, new userProfile_1.UserProfileInfo());
                //userProfile.transport = step.values.transport;
                //userProfile.name = step.values.name;
                //userProfile.age = step.values.age;
                let msg = `I have your mode of transport as ${userProfile.transport} and your name as ${userProfile.name}.`;
                if (userProfile.age !== -1) {
                    msg += ` And age as ${userProfile.age}.`;
                }
                yield step.context.sendActivity(msg);
            }
            else {
                yield step.context.sendActivity('Thanks. Your profile will not be kept.');
            }
            // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
            return yield step.endDialog();
        });
    }
    agePromptValidator(promptContext) {
        return __awaiter(this, void 0, void 0, function* () {
            // This condition is our validation rule. You can also change the value at this point.
            return promptContext.recognized.succeeded && promptContext.recognized.value > 0 && promptContext.recognized.value < 150;
        });
    }
}
exports.UserProfileDialog = UserProfileDialog;
//# sourceMappingURL=userProfileDialog.js.map