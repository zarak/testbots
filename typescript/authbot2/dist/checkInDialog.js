"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const initialId = 'mainDialog';
class CheckInDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(id, accessor) {
        super(id);
        this.accessor = accessor;
        this.accessor = accessor;
        this.initialDialogId = initialId;
        this.addDialog(new botbuilder_dialogs_1.TextPrompt('textPrompt'));
        const steps = [
            this.namePrompt.bind(this),
            this.roomPrompt.bind(this),
            this.acknowledgementStep.bind(this),
        ];
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(initialId, steps));
    }
    namePrompt(step) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield step.prompt('textPrompt', "What is your name?");
        });
    }
    roomPrompt(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkInData = { name: step.result };
            yield this.accessor.set(step.context, checkInData);
            return yield step.prompt('textPrompt', `Hi ${checkInData.name}. What room will you be staying in?`);
        });
    }
    acknowledgementStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkInData = yield this.accessor.get(step.context);
            checkInData.roomNumber = step.result;
            yield this.accessor.set(step.context, checkInData);
            return step.endDialog(checkInData);
        });
    }
}
exports.CheckInDialog = CheckInDialog;
//# sourceMappingURL=checkInDialog.js.map