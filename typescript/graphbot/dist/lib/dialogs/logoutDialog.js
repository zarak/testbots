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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
class LogoutDialog extends botbuilder_dialogs_1.ComponentDialog {
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
            if (innerDc.context.activity.type === botbuilder_1.ActivityTypes.Message) {
                const text = innerDc.context.activity.text ? innerDc.context.activity.text.toLowerCase() : '';
                if (text === 'logout') {
                    // The bot adapter encapsulates the authentication processes.
                    const botAdapter = innerDc.context.adapter;
                    //await botAdapter.signOutUser(innerDc.context, process.env.ConnectionName);
                    yield innerDc.context.sendActivity('You have been signed out.');
                    return yield innerDc.cancelAllDialogs();
                }
            }
        });
    }
}
exports.LogoutDialog = LogoutDialog;
//# sourceMappingURL=logoutDialog.js.map