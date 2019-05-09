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
const dialogBot_1 = require("./dialogBot");
class AuthBot extends dialogBot_1.DialogBot {
    constructor(conversationState, userState, dialog) {
        super(conversationState, userState, dialog);
        //this.onMembersAdded(async (context, next) => {
        //const membersAdded = context.activity.membersAdded;
        //for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        //if (membersAdded[cnt].id !== context.activity.recipient.id) {
        //await context.sendActivity('Welcome to Authentication Bot on MSGraph. Type anything to get logged in. Type \'logout\' to sign-out.');
        //}
        //}
        //// By calling next() you ensure that the next BotHandler is run.
        //await next();
        //});
        this.onTokenResponseEvent((context, next) => __awaiter(this, void 0, void 0, function* () {
            console.log('Running dialog with Token Response Event Activity.');
            // Run the Dialog with the new Token Response Event Activity.
            yield this.dialog.run(context, this.dialogState);
            // By calling next() you ensure that the next BotHandler is run.
            yield next();
        }));
    }
}
exports.AuthBot = AuthBot;
//# sourceMappingURL=authBot.js.map