// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BotState, CardFactory } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { DialogBot } from './dialogBot';

import { Logger } from '../logger';

const WelcomeCard = require('../../resources/welcomeCard.json');

export class DialogAndWelcomeBot extends DialogBot {
}
