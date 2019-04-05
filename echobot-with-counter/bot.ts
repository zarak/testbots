// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.

import { TurnContext, ActivityTypes, ConversationState, StatePropertyAccessor } from 'botbuilder';

// Turn counter property
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';

export class EchoBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    private _countProperty : StatePropertyAccessor;
    private _conversationState : ConversationState;
    constructor(conversationState: ConversationState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this._countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this._conversationState = conversationState;
    }
    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext: TurnContext) {
        // Handle message activity type. User's responses via text or speech or card interactions flow back to the bot as Message activity.
        // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        if (turnContext.activity.type === ActivityTypes.Message) {
            // read from state.
            let count = await this._countProperty.get(turnContext);
            count = count === undefined ? 1 : ++count;
            await turnContext.sendActivity(`${ count }: You said "${ turnContext.activity.text }"`);
            // increment and set turn counter.
            await this._countProperty.set(turnContext, count);
        } else {
            // Generic handler for all other activity types.
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
        // Save state changes
        await this._conversationState.saveChanges(turnContext);
    }
}
