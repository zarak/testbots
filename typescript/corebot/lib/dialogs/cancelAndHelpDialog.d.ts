import { ComponentDialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
/**
 * This base class watches for common phrases like "help" and "cancel" and takes action on them
 * BEFORE they reach the normal bot logic.
 */
export declare class CancelAndHelpDialog extends ComponentDialog {
    constructor(id: string);
    onBeginDialog(innerDc: DialogContext, options: any): Promise<DialogTurnResult>;
    onContinueDialog(innerDc: DialogContext): Promise<DialogTurnResult>;
    private interrupt;
}
