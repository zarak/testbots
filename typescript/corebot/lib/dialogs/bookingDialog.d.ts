import { CancelAndHelpDialog } from './cancelAndHelpDialog';
export declare class BookingDialog extends CancelAndHelpDialog {
    constructor(id: string);
    /**
     * If a destination city has not been provided, prompt for one.
     */
    private destinationStep;
    /**
     * If an origin city has not been provided, prompt for one.
     */
    private originStep;
    /**
     * If a travel date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    private travelDateStep;
    /**
     * Confirm the information the user has provided.
     */
    private confirmStep;
    /**
     * Complete the interaction and end the dialog.
     */
    private finalStep;
    private isAmbiguous;
}
