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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
/**
 * This base class watches for common phrases like "help" and "cancel" and takes action on them
 * BEFORE they reach the normal bot logic.
 */
class CancelAndHelpDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(id) {
        super(id);
    }
    onBeginDialog(innerDc, options) {
        const _super = Object.create(null, {
            onBeginDialog: { get: () => super.onBeginDialog }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.interrupt(innerDc);
            if (result) {
                return result;
            }
            return yield _super.onBeginDialog.call(this, innerDc, options);
        });
    }
    onContinueDialog(innerDc) {
        const _super = Object.create(null, {
            onContinueDialog: { get: () => super.onContinueDialog }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.interrupt(innerDc);
            if (result) {
                return result;
            }
            return yield _super.onContinueDialog.call(this, innerDc);
        });
    }
    interrupt(innerDc) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = innerDc.context.activity.text.toLowerCase();
            switch (text) {
                case 'help':
                case '?':
                    yield innerDc.context.sendActivity('[ This is where to send sample help to the user... ]');
                    return { status: botbuilder_dialogs_1.DialogTurnStatus.waiting };
                case 'cancel':
                case 'quit':
                    yield innerDc.context.sendActivity('Cancelling');
                    return yield innerDc.cancelAllDialogs();
            }
            return;
        });
    }
}
exports.CancelAndHelpDialog = CancelAndHelpDialog;
//# sourceMappingURL=cancelAndHelpDialog.js.map