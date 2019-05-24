// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { QnAMakerResult } from 'botbuilder-ai';
import * as https from 'https';

// Minimum Score For Low Score Variation
const MinimumScoreForLowScoreVariation = 20;

// Previous Low Score Variation Multiplier
const PreviousLowScoreVariationMultiplier = 1.4;

// Max Low Score Variation Multiplier
const MaxLowScoreVariationMultiplier = 2.0;

// Maximum Score For Low Score Variation
const MaximumScoreForLowScoreVariation = 95.0;

interface FeedbackRecords {
    FeedbackRecords: [
        {
            UserId?: string,
            UserQuestion?: string,
            QnaId?: number,
        }
    ];
}

export class ActiveLearningHelper {
    /**
     * Returns list of qnaSearch results which have low score variation.
     * @param {QnAMakerResult[]} qnaSearchResults A list of results returned from the QnA getAnswer call.
     */
    public getLowScoreVariation(qnaSearchResults: QnAMakerResult[]) {
        if (qnaSearchResults == null || qnaSearchResults.length === 0) {
            return [];
        }

        if (qnaSearchResults.length === 1) {
            return qnaSearchResults;
        }

        const filteredQnaSearchResult: QnAMakerResult[] = [];
        const topAnswerScore: number = qnaSearchResults[0].score * 100;
        let prevScore: number = topAnswerScore;

        if ((topAnswerScore > MinimumScoreForLowScoreVariation) && (topAnswerScore < MaximumScoreForLowScoreVariation)) {
            filteredQnaSearchResult.push(qnaSearchResults[0]);

            for (let i = 1; i < qnaSearchResults.length; i++) {
                if (this.includeForClustering(
                    prevScore,
                    qnaSearchResults[i].score * 100,
                    PreviousLowScoreVariationMultiplier,
                ) && this.includeForClustering(
                    topAnswerScore,
                    qnaSearchResults[i].score * 100,
                    MaxLowScoreVariationMultiplier,
                )) {
                    prevScore = qnaSearchResults[i].score * 100;
                    filteredQnaSearchResult.push(qnaSearchResults[i]);
                }
            }
        }

        return filteredQnaSearchResult;
    }

    public includeForClustering(prevScore: number, currentScore: number, multiplier: number) {
        return (prevScore - currentScore) < (multiplier * Math.sqrt(prevScore));
    }

    /**
     * Method to call QnAMaker Train API for Active Learning
     * @param {string} host Endpoint host of the runtime
     * @param {FeedbackRecords[]} feedbackRecords Body of the train API
     * @param {string} kbId Knowledgebase Id
     * @param {string} key Endpoint key
     */
    public async callTrain(host: string, feedbackRecords: FeedbackRecords, kbId: string, key: string) {

        const data = JSON.stringify(feedbackRecords);
        console.log('data', data);
        const headers = {
            'Authorization': 'EndpointKey ' + key,
            'Content-Length': data.length,
            'Content-Type': 'application/json',
        };

        const options = {
            headers,
            hostname:  host.split('/')[2],
            method: 'POST',
            path: '/qnamaker/knowledgebases/' + kbId + '/train/',
            port: 443,
        };

        const req = https.request( options, (res) => {
            // TODO: Put in logger or activity insights
            console.log(res.statusCode);
        });
        req.write(data);
        req.end();
    }
}
