import { BotState } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { DialogBot } from './dialogBot';
import { Logger } from '../logger';
export declare class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState: BotState, userState: BotState, dialog: Dialog, logger: Logger);
}
