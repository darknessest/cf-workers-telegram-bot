import TelegramBusinessMessage from './TelegramBusinessMessage.js';
import TelegramInlineQuery from './TelegramInlineQuery.js';
import TelegramMessage from './TelegramMessage.js';
import TelegramPoll from './TelegramPoll.js';
import TelegramPollAnswer from './TelegramPollAnswer.js';

interface PartialTelegramUpdate {
	update_id?: number;
	message?: TelegramMessage;
	edited_message?: TelegramMessage;
	channel_post?: TelegramMessage;
	edited_channel_post?: TelegramMessage;
	inline_query?: TelegramInlineQuery;
	business_message?: TelegramBusinessMessage;
	poll?: TelegramPoll;
	poll_answer?: TelegramPollAnswer;
}
export default PartialTelegramUpdate;
