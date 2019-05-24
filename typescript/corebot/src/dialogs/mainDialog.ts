// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BookingDetails } from './bookingDetails';
import { ClusteringDialog } from './clusteringDialog';

import { ConversationState, StatePropertyAccessor, TurnContext } from 'botbuilder';

import {
    ComponentDialog,
    DialogSet,
    DialogState,
    DialogTurnResult,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext,
} from 'botbuilder-dialogs';

import { QnAMakerEndpoint } from 'botbuilder-ai';
import { Logger } from '../logger';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const CLUSTERING_DIALOG = 'clusteringDialog';

export class MainDialog extends ComponentDialog {
    constructor(private logger: Logger, endpoint: QnAMakerEndpoint, conversationState: ConversationState) {
        super('MainDialog');
        if (!logger) {
            logger = console as Logger;
            logger.log('[MainDialog]: logger not passed in, defaulting to console');
        }

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new ClusteringDialog(CLUSTERING_DIALOG, endpoint, conversationState))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this),
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {TurnContext} context
     */
    public async run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    private async introStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        return await stepContext.prompt('TextPrompt', { prompt: 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"' });
    }

    /**
     * Second step in the waterall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    private async actStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const bookingDetails = new BookingDetails();

        // In this sample we only have a single intent we are concerned with. However, typically a scenario
        // will have multiple different intents each corresponding to starting a different child dialog.

        return await stepContext.beginDialog('clusteringDialog');
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result as BookingDetails;
            // Now we have all the booking details.

            // This is where calls to the booking AOU service or database would go.

            // If the call to the booking service was successful tell the user.
            const msg = `I have you booked to ${ result.destination } from ${ result.origin }.`;
            await stepContext.context.sendActivity(msg);
        } else {
            await stepContext.context.sendActivity('Thank you.');
        }
        return await stepContext.endDialog();
    }
}
