"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var botbuilder_1 = require("botbuilder");
var botbuilder_dialogs_1 = require("botbuilder-dialogs");
// Define state property accessor names.
var DIALOG_STATE_PROPERTY = 'dialogStateProperty';
var ORDER_STATE_PROPERTY = 'orderStateProperty';
var ORDER_PROMPT = 'orderingDialog';
var CHOICE_PROMPT = 'choicePrompt';
// The options on the dinner menu, including commands for the bot.
var dinnerMenu = {
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
};
;
var InterruptBot = /** @class */ (function () {
    function InterruptBot(conversationState) {
        this.conversationState = conversationState;
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.orderStateAccessor = this.conversationState.createProperty(ORDER_STATE_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogStateAccessor);
        this.dialogs
            .add(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT));
        var order = [
            this.orderStart.bind(this),
            this.choiceStep.bind(this),
        ];
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(ORDER_PROMPT, order));
    }
    InterruptBot.prototype.orderStart = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultOrderCart, orderCart;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defaultOrderCart = { orders: [], total: 0 };
                        return [4 /*yield*/, this.orderStateAccessor.get(step.context, defaultOrderCart)];
                    case 1:
                        orderCart = _a.sent();
                        console.log(orderCart);
                        return [4 /*yield*/, step.prompt(CHOICE_PROMPT, "What would you like?", dinnerMenu.choices)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    InterruptBot.prototype.choiceStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var choice, orderCart, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        choice = step.result;
                        if (!choice.value.match(/process order/ig)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.orderStateAccessor.get(step.context)];
                    case 1:
                        // Get cart from state accessor
                        orderCart = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        item = dinnerMenu[choice.value];
                        return [4 /*yield*/, this.orderStateAccessor.get(step.context)];
                    case 3:
                        orderCart = _a.sent();
                        orderCart.orders.push(item.description);
                        _a.label = 4;
                    case 4:
                        console.log(orderCart);
                        return [2 /*return*/, step.endDialog()];
                }
            });
        });
    };
    InterruptBot.prototype.onTurn = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var dc, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(context.activity.type === botbuilder_1.ActivityTypes.Message)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.dialogs.createContext(context)];
                    case 1:
                        dc = _a.sent();
                        return [4 /*yield*/, dc.continueDialog()];
                    case 2:
                        results = _a.sent();
                        return [4 /*yield*/, this.conversationState.saveChanges(context)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return InterruptBot;
}());
exports.InterruptBot = InterruptBot;
//# sourceMappingURL=bot.js.map