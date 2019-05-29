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
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
/**
 * This class is a wrapper for the Microsoft Graph API.
 * See: https://developer.microsoft.com/en-us/graph for more information.
 */
class SimpleGraphClient {
    constructor(token) {
        this.token = token;
        if (!token || !token.trim()) {
            throw new Error('SimpleGraphClient: Invalid token received.');
        }
        // Get an Authenticated Microsoft Graph client using the token issued to the user.
        this.graphClient = microsoft_graph_client_1.Client.init({
            authProvider: (done) => {
                done(null, this.token); // First parameter takes an error if you can't get an access token.
            }
        });
    }
    /**
     * Sends an email on the user's behalf.
     * @param {string} toAddress Email address of the email's recipient.
     * @param {string} subject Subject of the email to be sent to the recipient.
     * @param {string} content Email message to be sent to the recipient.
     */
    sendMail(toAddress, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!toAddress || !toAddress.trim()) {
                throw new Error('SimpleGraphClient.sendMail(): Invalid `toAddress` parameter received.');
            }
            if (!subject || !subject.trim()) {
                throw new Error('SimpleGraphClient.sendMail(): Invalid `subject`  parameter received.');
            }
            if (!content || !content.trim()) {
                throw new Error('SimpleGraphClient.sendMail(): Invalid `content` parameter received.');
            }
            // Create the email.
            const mail = {
                body: {
                    content: content,
                    contentType: 'Text'
                },
                subject: subject,
                toRecipients: [{
                        emailAddress: {
                            address: toAddress
                        }
                    }]
            };
            // Send the message.
            return yield this.graphClient
                .api('/me/sendMail')
                .post({ message: mail }, (error, res) => {
                if (error) {
                    throw error;
                }
                else {
                    return res;
                }
            });
        });
    }
    /**
     * Gets recent mail the user has received within the last hour and displays up to 5 of the emails in the bot.
     */
    getRecentMail() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.graphClient
                .api('/me/messages')
                .version('beta')
                .top(5)
                .get().then((res) => {
                return res;
            });
        });
    }
    /**
     * Collects information about the user in the bot.
     */
    getMe() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.graphClient
                .api('/me')
                .get().then((res) => {
                return res;
            });
        });
    }
    /**
     * Collects the user's manager in the bot.
     */
    getManager() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.graphClient
                .api('/me/manager')
                .version('beta')
                .select('displayName')
                .get().then((res) => {
                return res;
            });
        });
    }
}
exports.SimpleGraphClient = SimpleGraphClient;
//# sourceMappingURL=simple-graph-client.js.map