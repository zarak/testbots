import { DialogTurnResult, WaterfallStepContext, ComponentDialog, DateTimePrompt, WaterfallDialog } from 'botbuilder-dialogs';
import { StatePropertyAccessor } from 'botbuilder';
import { IUserInfo } from './userInfoState';

const initialId = 'mainDialog';

export class SetAlarmDialog extends ComponentDialog {
    constructor(id: string, private accessor: StatePropertyAccessor) {
        super(id);

        this.accessor = accessor;
        this.initialDialogId = initialId;

        this.addDialog(new DateTimePrompt('datePrompt'));

        const steps: ((sc: WaterfallStepContext<{}>) => Promise<DialogTurnResult<any>>)[] = [
            this.timeStep.bind(this),
            this.acknowledgementStep.bind(this),
        ];

        this.addDialog(new WaterfallDialog(initialId, steps));
    }

    private async timeStep(step: WaterfallStepContext): Promise<DialogTurnResult<any>> {
        const checkInData: IUserInfo = await this.accessor.get(step.context, 
            { 
                name: '',
                roomNumber: '',
                tableNumber: 0,
                alarm: ''
            }
        );
        const greeting = `Welcome ${checkInData.name}`;
        return await step.prompt('datePrompt', `Hi ${checkInData.name}. What time would you like your alarm to be set?`);
    }

    private async acknowledgementStep(step: WaterfallStepContext) {
        const checkInData = await this.accessor.get(step.context);
        checkInData.alarm = step.result[0];
        await step.context.sendActivity(`Your alarm is set to ${checkInData.alarm} for room ${checkInData.roomNumber}.`);
        await this.accessor.set(step.context, checkInData);
        return step.endDialog(checkInData);
    }
}
