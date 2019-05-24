import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import { ComponentDialog, DialogState } from 'botbuilder-dialogs';
import { Logger } from '../logger';
export declare class MainDialog extends ComponentDialog {
    private logger;
    constructor(logger: Logger);
    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {TurnContext} context
     */
    run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>): Promise<void>;
    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    private introStep;
    /**
     * Second step in the waterall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    private actStep;
    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    private finalStep;
}
