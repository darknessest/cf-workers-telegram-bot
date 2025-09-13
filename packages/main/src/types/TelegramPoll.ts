import TelegramMessageEntity from './TelegramMessageEntity.js';
import TelegramPollOption from './TelegramPollOption.js';

export default interface TelegramPoll {
	id: string;
	question: string;
	options: TelegramPollOption[];
	total_voter_count: number;
	is_closed: boolean;
	is_anonymous: boolean;
	type: 'regular' | 'quiz';
	allows_multiple_answers: boolean;
	correct_option_id?: number;
	explanation?: string;
	explanation_entities?: TelegramMessageEntity[];
	open_period?: number;
	close_date?: number;
}


