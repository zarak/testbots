// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { StatePropertyAccessor, ConversationState, UserState, ActivityHandler } from 'botbuilder';
//import { WaterfallStepContext, DialogSet, Dialog } from 'botbuilder-dialogs';
import { UserProfileDialog } from '../dialogs/userProfileDialog';

export class DialogBot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     * @param {any} logger object for logging events, defaults to console if none is provided
     */
    protected dialogState: StatePropertyAccessor;
    constructor(protected conversationState: ConversationState, protected userState: UserState, public dialog: UserProfileDialog, public logger: any) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');
        if (!logger) {
            logger = console;
            logger.log('[DialogBot]: logger not passed in, defaulting to console');
        }

        this.userState = userState;
        this.dialog = dialog;
        this.logger = logger;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });

        this.onMessage(async (context, next) => {
            this.logger.log('Running dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            await context.sendActivity(`dialogBot first lel`);
            await this.dialog.run(context, this.dialogState);
            await next();

        });

    }
}
