import { TurnContext, ActivityTypes, StatePropertyAccessor, ConversationState } from 'botbuilder';
import { DialogTurnStatus, DialogTurnResult, ChoicePrompt, DialogSet, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';

// Define state property accessor names.
const DIALOG_STATE_PROPERTY = 'dialogStateProperty';
const ORDER_STATE_PROPERTY = 'orderStateProperty';

const ORDER_PROMPT = 'orderingDialog';
const CHOICE_PROMPT = 'choicePrompt';

//type MenuItem = { description: string; price: number; };
//type Menu = { choices: string[];  };

// The options on the dinner menu, including commands for the bot.
const dinnerMenu = {
    choices: ["Potato Salad - $5.99", "Tuna Sandwich - $6.89", "Clam Chowder - $4.50",
        "Process order", "Cancel", "More info", "Help"],
    "Potato Salad - $5.99": {
        description: "Potato Salad",
        price: 5.99
    },
    "Tuna Sandwich - $6.89": {
        description: "Tuna Sandwich",
        price: 6.89
    },
    "Clam Chowder - $4.50": {
        description: "Clam Chowder",
        price: 4.50
    }
}

interface IOrderCart {
    orders: string[],
    total: number
};

export class InterruptBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    private dialogStateAccessor: StatePropertyAccessor;
    private orderStateAccessor: StatePropertyAccessor;
    private dialogs: DialogSet;

    constructor(private conversationState: ConversationState) {
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.orderStateAccessor = this.conversationState.createProperty(ORDER_STATE_PROPERTY);

        this.dialogs = new DialogSet(this.dialogStateAccessor);

        this.dialogs
            .add(new ChoicePrompt(CHOICE_PROMPT));

        const order: ((sc: WaterfallStepContext<IOrderCart>) => Promise<DialogTurnResult<any>>)[] = [
            this.orderStart.bind(this),
            this.choiceStep.bind(this),
        ];

        this.dialogs.add(new WaterfallDialog(ORDER_PROMPT, order));
    }

    private async orderStart(step: WaterfallStepContext) {
        const defaultOrderCart = { orders: [], total : 0 };
        const orderCart = await this.orderStateAccessor.get(step.context, defaultOrderCart);
        console.log(orderCart);

        return await step.prompt(CHOICE_PROMPT, "What would you like?", dinnerMenu.choices);
    }

    private async choiceStep(step: WaterfallStepContext) {
        const choice = step.result;
        let orderCart: IOrderCart;
        if (choice.value.match(/process order/ig)) {
            // Get cart from state accessor
            orderCart = await this.orderStateAccessor.get(step.context);
        } else {
            // @TODO: Need to create type for choice on menu
            const item = dinnerMenu[choice.value];
            orderCart = await this.orderStateAccessor.get(step.context);
            orderCart.orders.push(item.description);
        }
        console.log(orderCart);
        return step.endDialog();
    }

    async onTurn(context: TurnContext) {
        if (context.activity.type === ActivityTypes.Message) {
            const dc = await this.dialogs.createContext(context);
            const results = await dc.continueDialog();
            
            await this.conversationState.saveChanges(context);
        }
    }
}
