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
// Define identifiers for our state property accessors.
var DIALOG_STATE_ACCESSOR = 'dialogStateAccessor';
var RESERVATION_ACCESSOR = 'reservationAccessor';
// Define identifiers for our dialogs and prompts.
var RESERVATION_DIALOG = 'reservationDialog';
var SIZE_RANGE_PROMPT = 'rangePrompt';
var LOCATION_PROMPT = 'locationPrompt';
var RESERVATION_DATE_PROMPT = 'reservationDatePrompt';
;
var GatherBot = /** @class */ (function () {
    function GatherBot(conversationState) {
        this.conversationState = conversationState;
        this.dialogStateAccessor = this.conversationState.createProperty(DIALOG_STATE_ACCESSOR);
        this.reservationAccessor = this.conversationState.createProperty(RESERVATION_ACCESSOR);
        this.dialogSet = new botbuilder_dialogs_1.DialogSet(this.dialogStateAccessor);
        this.dialogSet.add(new botbuilder_dialogs_1.NumberPrompt(SIZE_RANGE_PROMPT));
        this.dialogSet.add(new botbuilder_dialogs_1.ChoicePrompt(LOCATION_PROMPT));
        this.dialogSet.add(new botbuilder_dialogs_1.DateTimePrompt(RESERVATION_DATE_PROMPT));
        var reservations = [
            this.promptForPartySize.bind(this),
            this.promptForLocation.bind(this),
            this.promptForReservationDate.bind(this),
            this.acknowledgeReservation.bind(this),
        ];
        this.dialogSet.add(new botbuilder_dialogs_1.WaterfallDialog(RESERVATION_DIALOG, reservations));
    }
    GatherBot.prototype.promptForPartySize = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, step.prompt(SIZE_RANGE_PROMPT, {
                            prompt: 'How many people is the reservation for?',
                            retryPrompt: 'How large is your party?',
                            validations: { min: 3, max: 8 },
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GatherBot.prototype.promptForLocation = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var resData, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        resData = { size: step.result, location: '', date: '' };
                        return [4 /*yield*/, this.reservationAccessor.set(step.context, resData)];
                    case 1:
                        _c.sent();
                        _b = (_a = console).log;
                        return [4 /*yield*/, this.reservationAccessor.get(step.context, resData)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, step.prompt(LOCATION_PROMPT, {
                                prompt: "Please choose a location",
                                retryPrompt: 'Sorry, please choose a location from the list.',
                                choices: ['Redmond', 'Bellevue', 'Seattle'],
                            })];
                    case 3: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    GatherBot.prototype.promptForReservationDate = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var resData, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.reservationAccessor.get(step.context)];
                    case 1:
                        resData = _c.sent();
                        resData.location = step.result.value; // use value field for text prompt
                        return [4 /*yield*/, this.reservationAccessor.set(step.context, resData)];
                    case 2:
                        _c.sent();
                        _b = (_a = console).log;
                        return [4 /*yield*/, this.reservationAccessor.get(step.context, resData)];
                    case 3:
                        _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, step.prompt(RESERVATION_DATE_PROMPT, {
                                prompt: 'Great. When will the reservation be for?',
                                retryPrompt: 'What time should we make your reservation for?'
                            })];
                    case 4: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    GatherBot.prototype.acknowledgeReservation = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var resolution, time, resData, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        resolution = step.result[0];
                        time = resolution.value || resolution.start;
                        // Send an acknowledgement to the user.
                        return [4 /*yield*/, step.context.sendActivity('Thank you. We will confirm your reservation shortly.')];
                    case 1:
                        // Send an acknowledgement to the user.
                        _c.sent();
                        return [4 /*yield*/, this.reservationAccessor.get(step.context)];
                    case 2:
                        resData = _c.sent();
                        resData.date = time;
                        return [4 /*yield*/, this.reservationAccessor.set(step.context, resData)];
                    case 3:
                        _c.sent();
                        _b = (_a = console).log;
                        return [4 /*yield*/, this.reservationAccessor.get(step.context, resData)];
                    case 4:
                        _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, step.endDialog(resData)];
                    case 5: 
                    // Return the collected information to the parent context.
                    return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    GatherBot.prototype.onTurn = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, reservation, dc, dialogTurnResult, resData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = context.activity.type;
                        switch (_a) {
                            case botbuilder_1.ActivityTypes.Message: return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 15];
                    case 1: return [4 /*yield*/, this.reservationAccessor.get(context, null)];
                    case 2:
                        reservation = _b.sent();
                        return [4 /*yield*/, this.dialogSet.createContext(context)];
                    case 3:
                        dc = _b.sent();
                        if (!!dc.activeDialog) return [3 /*break*/, 8];
                        if (!!reservation) return [3 /*break*/, 5];
                        return [4 /*yield*/, dc.beginDialog(RESERVATION_DIALOG)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, context.sendActivity("We'll see you on " + reservation)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [3 /*break*/, 13];
                    case 8: return [4 /*yield*/, dc.continueDialog()];
                    case 9:
                        dialogTurnResult = _b.sent();
                        console.log(dialogTurnResult);
                        return [4 /*yield*/, this.reservationAccessor.get(context)];
                    case 10:
                        resData = _b.sent();
                        if (!(dialogTurnResult.status === botbuilder_dialogs_1.DialogTurnStatus.complete)) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.reservationAccessor.set(context, resData)];
                    case 11:
                        _b.sent();
                        return [4 /*yield*/, context.sendActivity("Your party of " + resData.size + " is " +
                                ("confirmed for " + resData.date + " in ") +
                                (resData.location + "."))];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13: return [4 /*yield*/, this.conversationState.saveChanges(context, false)];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 16];
                    case 15: return [3 /*break*/, 16];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return GatherBot;
}());
exports.GatherBot = GatherBot;
//# sourceMappingURL=bot.js.map