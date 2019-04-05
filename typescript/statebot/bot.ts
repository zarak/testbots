import { TurnContext, ActivityTypes, ConversationState, UserState, StatePropertyAccessor } from 'botbuilder';

// The accessor names for the conversation data and user profile state property accessors.
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

export class StateBot {
    private _conversationData : StatePropertyAccessor;
    private _userProfile : StatePropertyAccessor;

    private _userState : UserState;
    private _conversationState : ConversationState;


    constructor(conversationState : ConversationState, userState: UserState) {
        this._conversationData = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this._userProfile = userState.createProperty(USER_PROFILE_PROPERTY);

        this._conversationState = conversationState;
        this._userState = userState;
    }

    async onTurn(context: TurnContext) {
        if (context.activity.type == 'message') {
            await context.sendActivity(`You said ${context.activity.text}`);
        } else {
            await context.sendActivity(`${context.activity.type} detected.`);
        }
    }

}
