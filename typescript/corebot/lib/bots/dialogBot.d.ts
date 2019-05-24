import { ActivityHandler, BotState } from 'botbuilder';
import { Dialog } from 'botbuilder-dialogs';
import { Logger } from '../logger';
export declare class DialogBot extends ActivityHandler {
    private conversationState;
    private userState;
    private logger;
    private dialog;
    private dialogState;
    /**
     *
     * @param {BotState} conversationState
     * @param {BotState} userState
     * @param {Dialog} dialog
     * @param {Logger} logger object for logging events, defaults to console if none is provided
     */
    constructor(conversationState: BotState, userState: BotState, dialog: Dialog, logger: Logger);
}
