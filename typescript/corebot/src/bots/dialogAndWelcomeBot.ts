// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BotState, CardFactory } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { DialogBot } from './dialogBot';

import { Logger } from '../logger';

const WelcomeCard = require('../../resources/welcomeCard.json');

export class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState: BotState, userState: BotState, dialog: Dialog, logger: Logger) {
        super(conversationState, userState, dialog, logger);

        this.onMembersAdded(async (context) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                    await context.sendActivity({ attachments: [welcomeCard] });
                }
            }
        });
    }
}
