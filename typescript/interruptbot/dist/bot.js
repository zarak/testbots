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
var USER_PROFILE_PROPERTY = 'userProfileProperty';
var TOP_LEVEL_DIALOG = 'dialog-topLevel';
var NAME_PROMPT = 'prompt-name';
var AGE_PROMPT = 'prompt-age';
var SELECTION_PROMPT = 'prompt-companySelection';
;
var ComplexBot = /** @class */ (function () {
    function ComplexBot(conversationState, userState) {
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.userProfileAccessor = this.userState.createProperty(USER_PROFILE_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogStateAccessor);
        this.dialogs
            .add(new botbuilder_dialogs_1.TextPrompt(NAME_PROMPT))
            .add(new botbuilder_dialogs_1.NumberPrompt(AGE_PROMPT))
            .add(new botbuilder_dialogs_1.ChoicePrompt(SELECTION_PROMPT));
        var toplevel = [
            this.nameStep.bind(this),
            this.ageStep.bind(this),
            this.startSelectionStep.bind(this),
            this.acknowledgementStep.bind(this),
        ];
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog(TOP_LEVEL_DIALOG, toplevel));
    }
    ComplexBot.prototype.nameStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, step.prompt(NAME_PROMPT, "Please enter your name.")];
                    case 1: 
                    //const userData : IUserData = {
                    //name: '',
                    //age: 0,
                    //company: '',
                    //};
                    //await this.userProfileAccessor.set(step.context, userData);
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ComplexBot.prototype.ageStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var userData, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.userProfileAccessor.get(step.context)];
                    case 1:
                        userData = _c.sent();
                        userData.name = step.result;
                        console.log("NAME", step.result);
                        return [4 /*yield*/, this.userProfileAccessor.set(step.context, userData)];
                    case 2:
                        _c.sent();
                        _b = (_a = console).log;
                        return [4 /*yield*/, this.userProfileAccessor.get(step.context)];
                    case 3:
                        _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, step.prompt(AGE_PROMPT, "Please enter your age.")];
                    case 4: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    ComplexBot.prototype.startSelectionStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var userData, age;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userProfileAccessor.get(step.context)];
                    case 1:
                        userData = _a.sent();
                        userData.age = step.result;
                        return [4 /*yield*/, this.userProfileAccessor.set(step.context, userData)];
                    case 2:
                        _a.sent();
                        age = step.result;
                        if (!(age < 20)) return [3 /*break*/, 4];
                        return [4 /*yield*/, step.context.sendActivity("Oh noes lel")];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, step.context.sendActivity("It's all good homie")];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, step.next()];
                    case 7: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ComplexBot.prototype.acknowledgementStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = console).log;
                        return [4 /*yield*/, this.userProfileAccessor.get(step.context)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, step.endDialog()];
                    case 2: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    ComplexBot.prototype.onTurn = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var dc, results, userData, _a, emptyUserData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(context.activity.type === botbuilder_1.ActivityTypes.Message)) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.dialogs.createContext(context)];
                    case 1:
                        dc = _b.sent();
                        return [4 /*yield*/, dc.continueDialog()];
                    case 2:
                        results = _b.sent();
                        userData = void 0;
                        _a = results.status;
                        switch (_a) {
                            case botbuilder_dialogs_1.DialogTurnStatus.cancelled: return [3 /*break*/, 3];
                            case botbuilder_dialogs_1.DialogTurnStatus.empty: return [3 /*break*/, 3];
                            case botbuilder_dialogs_1.DialogTurnStatus.complete: return [3 /*break*/, 7];
                            case botbuilder_dialogs_1.DialogTurnStatus.waiting: return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 15];
                    case 3:
                        emptyUserData = {
                            name: '',
                            age: 0,
                            company: '',
                        };
                        return [4 /*yield*/, this.userProfileAccessor.set(context, emptyUserData)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, this.userState.saveChanges(context)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, dc.beginDialog(TOP_LEVEL_DIALOG)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 7: return [4 /*yield*/, this.userProfileAccessor.get(context)];
                    case 8:
                        userData = _b.sent();
                        return [4 /*yield*/, this.userProfileAccessor.set(context, userData)];
                    case 9:
                        _b.sent();
                        return [4 /*yield*/, this.userState.saveChanges(context)];
                    case 10:
                        _b.sent();
                        console.log("Complete", userData);
                        return [3 /*break*/, 15];
                    case 11: return [4 /*yield*/, this.userProfileAccessor.get(context)];
                    case 12:
                        // Need to persist data at each step
                        userData = _b.sent();
                        return [4 /*yield*/, this.userProfileAccessor.set(context, userData)];
                    case 13:
                        _b.sent();
                        return [4 /*yield*/, this.userState.saveChanges(context)];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 15: return [4 /*yield*/, this.conversationState.saveChanges(context)];
                    case 16:
                        _b.sent();
                        _b.label = 17;
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    return ComplexBot;
}());
exports.ComplexBot = ComplexBot;
//# sourceMappingURL=bot.js.map