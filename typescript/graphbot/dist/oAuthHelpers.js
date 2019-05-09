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
const simple_graph_client_1 = require("./simple-graph-client");
/**
 * These methods call the Microsoft Graph API. The following OAuth scopes are used:
 * 'OpenId' 'email' 'Mail.Send.Shared' 'Mail.Read' 'profile' 'User.Read' 'User.ReadBasic.All'
 * for more information about scopes see:
 * https://developer.microsoft.com/en-us/graph/docs/concepts/permissions_reference
 */
class OAuthHelpers {
    /**
     * Enable the user to send an email via the bot.
     * @param {TurnContext} context A TurnContext instance containing all the data needed for processing this conversation turn.
     * @param {TokenResponse} tokenResponse A response that includes a user token.
     * @param {string} emailAddress The email address of the recipient.
     */
    static sendMail(context, tokenResponse, emailAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!context) {
                throw new Error('OAuthHelpers.sendMail(): `context` cannot be undefined.');
            }
            if (!tokenResponse) {
                throw new Error('OAuthHelpers.sendMail(): `tokenResponse` cannot be undefined.');
            }
            const client = new simple_graph_client_1.SimpleGraphClient(tokenResponse.token);
            const me = yield client.getMe();
            yield client.sendMail(emailAddress, `Message from a bot!`, `Hi there! I had this message sent from a bot. - Your friend, ${me.displayName}`);
            yield context.sendActivity(`I sent a message to ${emailAddress} from your account.`);
        });
    }
    /**
     * Displays information about the user in the bot.
     * @param {TurnContext} context A TurnContext instance containing all the data needed for processing this conversation turn.
     * @param {TokenResponse} tokenResponse A response that includes a user token.
     */
    static listMe(context, tokenResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!context) {
                throw new Error('OAuthHelpers.listMe(): `context` cannot be undefined.');
            }
            if (!tokenResponse) {
                throw new Error('OAuthHelpers.listMe(): `tokenResponse` cannot be undefined.');
            }
            try {
                // Pull in the data from Microsoft Graph.
                const client = new simple_graph_client_1.SimpleGraphClient(tokenResponse.token);
                const me = yield client.getMe();
                const manager = yield client.getManager();
                yield context.sendActivity(`You are ${me.displayName} and you report to ${manager.displayName}.`);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.OAuthHelpers = OAuthHelpers;
//# sourceMappingURL=oAuthHelpers.js.map