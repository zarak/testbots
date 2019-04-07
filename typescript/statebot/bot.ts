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
        if (context.activity.type == ActivityTypes.Message) {
            const userProfileObject : {"name" : null | string, "age" : null | number } = 
                { 
                    "name": null,
                    "age": null
                };
            const userProfile = await this._userProfile.get(context, userProfileObject);
            const conversationData = await this._conversationData.get(context,
                {
                    promptedForUserName: false,
                });

            // Name has not been set
            if (userProfile.name == null) {
                await context.sendActivity("Enter your name: ");
            }
        } else {
            await context.sendActivity(`${context.activity.type} detected.`);
        }
    }

}
