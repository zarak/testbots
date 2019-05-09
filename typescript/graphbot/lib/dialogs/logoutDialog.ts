// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityTypes } from 'botbuilder';
import { ComponentDialog, DialogContext } from 'botbuilder-dialogs';

export class LogoutDialog extends ComponentDialog {
    async onBeginDialog(innerDc: DialogContext, options: object) {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }

        return await super.onBeginDialog(innerDc, options);
    }

    async onContinueDialog(innerDc: DialogContext) {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }

        return await super.onContinueDialog(innerDc);
    }

    async interrupt(innerDc: DialogContext) {
        if (innerDc.context.activity.type === ActivityTypes.Message) {
            const text = innerDc.context.activity.text ? innerDc.context.activity.text.toLowerCase() : '';
            if (text === 'logout') {
                // The bot adapter encapsulates the authentication processes.
                const botAdapter = innerDc.context.adapter;
                //await botAdapter.signOutUser(innerDc.context, process.env.ConnectionName);
                await innerDc.context.sendActivity('You have been signed out.');
                return await innerDc.cancelAllDialogs();
            }
        }
    }
}
