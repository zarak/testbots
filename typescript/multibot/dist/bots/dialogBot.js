"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
class DialogBot extends botbuilder_1.ActivityHandler {
    constructor(conversationState, userState, dialog, logger) {
        super();
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.logger = logger;
        if (!conversationState)
            throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState)
            throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog)
            throw new Error('[DialogBot]: Missing parameter. dialog is required');
        if (!logger) {
            logger = console;
            logger.log('[DialogBot]: logger not passed in, defaulting to console');
        }
        this.userState = userState;
        this.dialog = dialog;
        this.logger = logger;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.onMessage((context, next) => __awaiter(this, void 0, void 0, function* () {
            this.logger.log('Running dialog with Message Activity.');
            // Run the Dialog with the new message Activity.
            yield this.dialog.run(context, this.dialogState);
            yield next();
        }));
        this.onDialog((context, next) => __awaiter(this, void 0, void 0, function* () {
            // Save any state changes. The load happened during the execution of the Dialog.
            yield this.conversationState.saveChanges(context, false);
            yield this.userState.saveChanges(context, false);
            yield next();
        }));
    }
}
exports.DialogBot = DialogBot;
//# sourceMappingURL=dialogBot.js.map