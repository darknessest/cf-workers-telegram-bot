import TelegramUser from './TelegramUser.js';

export default interface TelegramPollAnswer {
	poll_id: string;
	user: TelegramUser;
	option_ids: number[];
}


