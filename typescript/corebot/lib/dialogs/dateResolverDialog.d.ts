import { CancelAndHelpDialog } from './cancelAndHelpDialog';
export declare class DateResolverDialog extends CancelAndHelpDialog {
    private static dateTimePromptValidator;
    constructor(id: string);
    private initialStep;
    private finalStep;
}
