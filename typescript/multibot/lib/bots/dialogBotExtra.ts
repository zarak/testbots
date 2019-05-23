// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { StatePropertyAccessor, ConversationState, UserState, ActivityHandler } from 'botbuilder';
//import { WaterfallStepContext, DialogSet, Dialog } from 'botbuilder-dialogs';
import { UserProfileDialog } from '../dialogs/userProfileDialog';
import { DialogBot } from './dialogBot';

export class DialogBotExtra extends DialogBot {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     * @param {any} logger object for logging events, defaults to console if none is provided
     */
    constructor(conversationState: ConversationState, userState: UserState, dialog: UserProfileDialog, logger: any) {
        super(conversationState, userState, dialog, logger);

        this.onMessage(async (context, next) => {
            this.logger.log('Running dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            //await this.dialog.run(context, this.dialogState);

            await context.sendActivity(`Now it's my turn lel`);

            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
    }
}
