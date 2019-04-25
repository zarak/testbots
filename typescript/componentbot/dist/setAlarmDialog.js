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
class SetAlarmDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(id, accessor) {
        super(id);
        this.accessor = accessor;
        this.accessor = accessor;
        this.initialDialogId = initialId;
        this.addDialog(new botbuilder_dialogs_1.DateTimePrompt('datePrompt'));
        const steps = [
            this.timeStep.bind(this),
            this.acknowledgementStep.bind(this),
        ];
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(initialId, steps));
    }
    timeStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkInData = yield this.accessor.get(step.context, {
                name: '',
                roomNumber: '',
                tableNumber: 0,
                alarm: ''
            });
            const greeting = `Welcome ${checkInData.name}`;
            return yield step.prompt('datePrompt', `Hi ${checkInData.name}. What time would you like your alarm to be set?`);
        });
    }
    acknowledgementStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkInData = yield this.accessor.get(step.context);
            //console.log("checkInData", checkInData);
            checkInData.alarm = step.result[0].value;
            //console.log("RESULT", step.result);
            yield step.context.sendActivity(`Your alarm is set to ${checkInData.alarm} for room ${checkInData.roomNumber}.`);
            yield this.accessor.set(step.context, checkInData);
            return step.endDialog();
        });
    }
}
exports.SetAlarmDialog = SetAlarmDialog;
//# sourceMappingURL=setAlarmDialog.js.map