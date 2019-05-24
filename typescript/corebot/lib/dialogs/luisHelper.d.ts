import { BookingDetails } from './bookingDetails';
import { TurnContext } from 'botbuilder';
import { Logger } from '../logger';
export declare class LuisHelper {
    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {Logger} logger
     * @param {TurnContext} context
     */
    static executeLuisQuery(logger: Logger, context: TurnContext): Promise<BookingDetails>;
    private static parseCompositeEntity;
    private static parseDatetimeEntity;
}
