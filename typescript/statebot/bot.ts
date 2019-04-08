import { TurnContext, ActivityTypes, ConversationState, UserState, StatePropertyAccessor } from 'botbuilder';

// The accessor names for the conversation data and user profile state property accessors.
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

export class StateBot1 {
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
                // Has the user been prompted on the previous turn?
                if (conversationData.promptedForUserName) {
                    userProfileObject.name = context.activity.text; // set the name using user's response
                    await context.sendActivity(`Thanks ${userProfileObject.name}`);
                } else {
                    await context.sendActivity("Enter your name: ");
                    conversationData.promptedForUserName = true;
                }
                await this._userProfile.set(context, userProfileObject);
                await this._userState.saveChanges(context);
            } else {
                await context.sendActivity(`Hello ${userProfile.name}`);
            }
            await this._conversationData.set(context, conversationData);
            await this._conversationState.saveChanges(context);
        } else {
            await context.sendActivity(`${context.activity.type} detected.`);
        }
    }
}


const CONVERSATION_FLOW_PROPERTY = 'conversationFlowProperty';

const question = {
    name: "name",
    age: "age",
    date: "date",
    none: "none"
};

interface IUserProfile {
    name?: string,
    age? : number,
    date? : string
};

export class StateBot2 {
    private _conversationFlow : StatePropertyAccessor;
    private _userProfile : StatePropertyAccessor;

    private _userState : UserState;
    private _conversationState : ConversationState;

    constructor(conversationState : ConversationState, userState: UserState) {
        this._conversationFlow = conversationState.createProperty(CONVERSATION_FLOW_PROPERTY);
        this._userProfile = userState.createProperty(USER_PROFILE_PROPERTY);

        this._conversationState = conversationState;
        this._userState = userState;
    }

    async onTurn(context: TurnContext) {
        if (context.activity.type == ActivityTypes.Message) {
            const flow = await this._conversationFlow.get(context, { lastQuestionAsked: question.none });
            const userProfileData : Partial<IUserProfile> = {};
            const profile = await this._userProfile.get(context, userProfileData);

            switch (flow.lastQuestionAsked) {
                case question.none:
                    await context.sendActivity("Let's get started! What is your name?");
                    flow.lastQuestionAsked = question.name;
                    break;
                case question.name:
                    userProfileData.name = context.activity.text;
                    await context.sendActivity(`I got your name as ${userProfileData.name}`);
                    await context.sendActivity("What is your age");
                    flow.lastQuestionAsked = question.age;
                    break;
                case question.age:
                    try {
                        userProfileData.age = parseInt(context.activity.text);
                    } catch (e) {
                        console.error("Couldn't process input", e);
                    }
                    await context.sendActivity(`I got your age as ${userProfileData.age}`);
                    await context.sendActivity("What is the date?");
                    flow.lastQuestionAsked = question.date;
                    break;
                default:
                    break;
            }
            await this._conversationFlow.set(context, flow);
            await this._conversationState.saveChanges(context);
        }
    }
}
