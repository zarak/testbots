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
class ReserveTableDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(id, accessor) {
        super(id);
        this.accessor = accessor;
        this.accessor = accessor;
        this.initialDialogId = initialId;
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt('choicePrompt'));
        const steps = [
            this.tableSizePrompt.bind(this),
            this.acknowledgementStep.bind(this),
        ];
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(initialId, steps));
    }
    tableSizePrompt(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkInData = yield this.accessor.get(step.context, {
                name: '',
                roomNumber: '',
                tableNumber: 0,
                alarm: ''
            });
            const greeting = `Welcome ${checkInData.name}`;
            const promptOptions = {
                prompt: `${greeting}, How many diners will be at your table?`,
                reprompt: 'That was not a valid choice, please select a table size between 1 and 6 guests.',
                choices: ['1', '2', '3', '4', '5', '6']
            };
            return yield step.prompt('choicePrompt', promptOptions);
        });
    }
    acknowledgementStep(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkInData = yield this.accessor.get(step.context);
            checkInData.tableSize = step.result.value;
            yield step.context.sendActivity(`Sounds great, we will reserve a table for you for ${checkInData.tableSize} diners.`);
            yield this.accessor.set(step.context, checkInData);
            return step.endDialog();
        });
    }
}
exports.ReserveTableDialog = ReserveTableDialog;
//# sourceMappingURL=reserveTableDialog.js.map