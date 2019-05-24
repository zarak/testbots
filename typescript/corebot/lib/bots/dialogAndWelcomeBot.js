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
const botbuilder_core_1 = require("botbuilder-core");
const dialogBot_1 = require("./dialogBot");
const WelcomeCard = require('../../resources/welcomeCard.json');
class DialogAndWelcomeBot extends dialogBot_1.DialogBot {
    constructor(conversationState, userState, dialog, logger) {
        super(conversationState, userState, dialog, logger);
        this.onMembersAdded((context) => __awaiter(this, void 0, void 0, function* () {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    const welcomeCard = botbuilder_core_1.CardFactory.adaptiveCard(WelcomeCard);
                    yield context.sendActivity({ attachments: [welcomeCard] });
                }
            }
        }));
    }
}
exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
//# sourceMappingURL=dialogAndWelcomeBot.js.map