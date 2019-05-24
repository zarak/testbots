"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
// Minimum Score For Low Score Variation
const MinimumScoreForLowScoreVariation = 20;
// Previous Low Score Variation Multiplier
const PreviousLowScoreVariationMultiplier = 1.4;
// Max Low Score Variation Multiplier
const MaxLowScoreVariationMultiplier = 2.0;
// Maximum Score For Low Score Variation
const MaximumScoreForLowScoreVariation = 95.0;
class ActiveLearningHelper {
    /**
     * Returns list of qnaSearch results which have low score variation.
     * @param {QnAMakerResult[]} qnaSearchResults A list of results returned from the QnA getAnswer call.
     */
    getLowScoreVariation(qnaSearchResults) {
        if (qnaSearchResults == null || qnaSearchResults.length === 0) {
            return [];
        }
        if (qnaSearchResults.length === 1) {
            return qnaSearchResults;
        }
        const filteredQnaSearchResult = [];
        const topAnswerScore = qnaSearchResults[0].score * 100;
        let prevScore = topAnswerScore;
        if ((topAnswerScore > MinimumScoreForLowScoreVariation) && (topAnswerScore < MaximumScoreForLowScoreVariation)) {
            filteredQnaSearchResult.push(qnaSearchResults[0]);
            for (let i = 1; i < qnaSearchResults.length; i++) {
                if (this.includeForClustering(prevScore, qnaSearchResults[i].score * 100, PreviousLowScoreVariationMultiplier) && this.includeForClustering(topAnswerScore, qnaSearchResults[i].score * 100, MaxLowScoreVariationMultiplier)) {
                    prevScore = qnaSearchResults[i].score * 100;
                    filteredQnaSearchResult.push(qnaSearchResults[i]);
                }
            }
        }
        return filteredQnaSearchResult;
    }
    includeForClustering(prevScore, currentScore, multiplier) {
        return (prevScore - currentScore) < (multiplier * Math.sqrt(prevScore));
    }
    /**
     * Method to call QnAMaker Train API for Active Learning
     * @param {string} host Endpoint host of the runtime
     * @param {FeedbackRecords[]} feedbackRecords Body of the train API
     * @param {string} kbId Knowledgebase Id
     * @param {string} key Endpoint key
     */
    callTrain(host, feedbackRecords, kbId, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(feedbackRecords);
            console.log('data', data);
            const headers = {
                'Authorization': 'EndpointKey ' + key,
                'Content-Length': data.length,
                'Content-Type': 'application/json',
            };
            const options = {
                headers,
                hostname: host.split('/')[2],
                method: 'POST',
                path: '/qnamaker/knowledgebases/' + kbId + '/train/',
                port: 443,
            };
            const req = https.request(options, (res) => {
                // TODO: Put in logger or activity insights
                console.log(res.statusCode);
            });
            req.write(data);
            req.end();
        });
    }
}
exports.ActiveLearningHelper = ActiveLearningHelper;
//# sourceMappingURL=activeLearningHelper.js.map