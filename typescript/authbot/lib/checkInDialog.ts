import { DialogTurnResult, WaterfallStepContext, ComponentDialog, TextPrompt, WaterfallDialog } from 'botbuilder-dialogs';
import { StatePropertyAccessor } from 'botbuilder';
import { IUserInfo } from './userInfoState';

const initialId = 'mainDialog';


export class CheckInDialog extends ComponentDialog {
    constructor(id: string, private accessor: StatePropertyAccessor) {
        super(id);

        this.accessor = accessor;
        this.initialDialogId = initialId;

        this.addDialog(new TextPrompt('textPrompt'));

        const steps: ((sc: WaterfallStepContext<{}>) => Promise<DialogTurnResult<any>>)[] = [
            this.namePrompt.bind(this),
            this.roomPrompt.bind(this),
            this.acknowledgementStep.bind(this),
        ];

        this.addDialog(new WaterfallDialog(initialId, steps));
    }

    private async namePrompt(step: WaterfallStepContext): Promise<DialogTurnResult<any>> {
        return await step.prompt('textPrompt', "What is your name?");
    }

    private async roomPrompt(step: WaterfallStepContext) {
        const checkInData: IUserInfo = { name: step.result };
        await this.accessor.set(step.context, checkInData);
        return await step.prompt('textPrompt', `Hi ${checkInData.name}. What room will you be staying in?`);
    }

    private async acknowledgementStep(step: WaterfallStepContext) {
        const checkInData: IUserInfo = await this.accessor.get(step.context);
        checkInData.roomNumber = step.result;
        await this.accessor.set(step.context, checkInData);
        return step.endDialog();
    }
}
