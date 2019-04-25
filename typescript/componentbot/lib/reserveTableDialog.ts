import { DialogTurnResult, WaterfallStepContext, ComponentDialog, ChoicePrompt, WaterfallDialog } from 'botbuilder-dialogs';
import { StatePropertyAccessor } from 'botbuilder';
import { IUserInfo } from './userInfoState';

const initialId = 'mainDialog';

export class ReserveTableDialog extends ComponentDialog {
    constructor(id: string, private accessor: StatePropertyAccessor) {
        super(id);

        this.accessor = accessor;
        this.initialDialogId = initialId;

        this.addDialog(new ChoicePrompt('choicePrompt'));

        const steps: ((sc: WaterfallStepContext<{}>) => Promise<DialogTurnResult<any>>)[] = [
            this.tableSizePrompt.bind(this),
            this.acknowledgementStep.bind(this),
        ];

        this.addDialog(new WaterfallDialog(initialId, steps));
    }

    private async tableSizePrompt(step: WaterfallStepContext): Promise<DialogTurnResult<any>> {
        const checkInData: IUserInfo = await this.accessor.get(step.context, 
            { 
                name: '',
                roomNumber: '',
                tableNumber: 0,
                alarm: ''
            }
        );
        const greeting = `Welcome ${checkInData.name}`;

        const promptOptions = {
            prompt: `${greeting}, How many diners will be at your table?`,
            reprompt: 'That was not a valid choice, please select a table size between 1 and 6 guests.',
            choices: ['1', '2', '3', '4', '5', '6']
        };

        return await step.prompt('choicePrompt', promptOptions);
    }

    private async acknowledgementStep(step: WaterfallStepContext) {
        const checkInData = await this.accessor.get(step.context);
        checkInData.tableSize = step.result.value;
        await step.context.sendActivity(`Sounds great, we will reserve a table for you for ${checkInData.tableSize} diners.`);
        await this.accessor.set(step.context, checkInData);
        return step.endDialog();
    }
}
