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
// The accessor names for the conversation data and user profile state property accessors.
var CONVERSATION_DATA_PROPERTY = 'conversationData';
var USER_PROFILE_PROPERTY = 'userProfile';
var StateBot1 = /** @class */ (function () {
    function StateBot1(conversationState, userState) {
        this._conversationData = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this._userProfile = userState.createProperty(USER_PROFILE_PROPERTY);
        this._conversationState = conversationState;
        this._userState = userState;
    }
    StateBot1.prototype.onTurn = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var userProfileObject, userProfile, conversationData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(context.activity.type == botbuilder_1.ActivityTypes.Message)) return [3 /*break*/, 14];
                        userProfileObject = {
                            "name": null,
                            "age": null
                        };
                        return [4 /*yield*/, this._userProfile.get(context, userProfileObject)];
                    case 1:
                        userProfile = _a.sent();
                        return [4 /*yield*/, this._conversationData.get(context, {
                                promptedForUserName: false,
                            })];
                    case 2:
                        conversationData = _a.sent();
                        if (!(userProfile.name == null)) return [3 /*break*/, 9];
                        if (!conversationData.promptedForUserName) return [3 /*break*/, 4];
                        userProfileObject.name = context.activity.text; // set the name using user's response
                        return [4 /*yield*/, context.sendActivity("Thanks " + userProfileObject.name)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, context.sendActivity("Enter your name: ")];
                    case 5:
                        _a.sent();
                        conversationData.promptedForUserName = true;
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this._userProfile.set(context, userProfileObject)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this._userState.saveChanges(context)];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, context.sendActivity("Hello " + userProfile.name)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11: return [4 /*yield*/, this._conversationData.set(context, conversationData)];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, this._conversationState.saveChanges(context)];
                    case 13:
                        _a.sent();
                        return [3 /*break*/, 16];
                    case 14: return [4 /*yield*/, context.sendActivity(context.activity.type + " detected.")];
                    case 15:
                        _a.sent();
                        _a.label = 16;
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return StateBot1;
}());
exports.StateBot1 = StateBot1;
var CONVERSATION_FLOW_PROPERTY = 'conversationFlowProperty';
var question = {
    name: "name",
    age: "age",
    date: "date",
    none: "none"
};
;
var StateBot2 = /** @class */ (function () {
    function StateBot2(conversationState, userState) {
        this._conversationFlow = conversationState.createProperty(CONVERSATION_FLOW_PROPERTY);
        this._userProfile = userState.createProperty(USER_PROFILE_PROPERTY);
        this._conversationState = conversationState;
        this._userState = userState;
    }
    StateBot2.prototype.onTurn = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var flow, userProfileData, profile, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(context.activity.type == botbuilder_1.ActivityTypes.Message)) return [3 /*break*/, 15];
                        return [4 /*yield*/, this._conversationFlow.get(context, { lastQuestionAsked: question.none })];
                    case 1:
                        flow = _b.sent();
                        userProfileData = {};
                        return [4 /*yield*/, this._userProfile.get(context, userProfileData)];
                    case 2:
                        profile = _b.sent();
                        _a = flow.lastQuestionAsked;
                        switch (_a) {
                            case question.none: return [3 /*break*/, 3];
                            case question.name: return [3 /*break*/, 5];
                            case question.age: return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, context.sendActivity("Let's get started! What is your name?")];
                    case 4:
                        _b.sent();
                        flow.lastQuestionAsked = question.name;
                        return [3 /*break*/, 12];
                    case 5:
                        userProfileData.name = context.activity.text;
                        return [4 /*yield*/, context.sendActivity("I got your name as " + userProfileData.name)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, context.sendActivity("What is your age")];
                    case 7:
                        _b.sent();
                        flow.lastQuestionAsked = question.age;
                        return [3 /*break*/, 12];
                    case 8:
                        try {
                            userProfileData.age = parseInt(context.activity.text);
                        }
                        catch (e) {
                            console.error("Couldn't process input", e);
                        }
                        return [4 /*yield*/, context.sendActivity("I got your age as " + userProfileData.age)];
                    case 9:
                        _b.sent();
                        return [4 /*yield*/, context.sendActivity("What is the date?")];
                    case 10:
                        _b.sent();
                        flow.lastQuestionAsked = question.date;
                        return [3 /*break*/, 12];
                    case 11: return [3 /*break*/, 12];
                    case 12: return [4 /*yield*/, this._conversationFlow.set(context, flow)];
                    case 13:
                        _b.sent();
                        return [4 /*yield*/, this._conversationState.saveChanges(context)];
                    case 14:
                        _b.sent();
                        _b.label = 15;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    return StateBot2;
}());
exports.StateBot2 = StateBot2;
