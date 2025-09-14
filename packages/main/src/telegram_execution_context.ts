import TelegramApi from './telegram_api.js';
import TelegramBot from './telegram_bot.js';
import TelegramInlineQueryResultArticle from './types/TelegramInlineQueryResultArticle.js';
import TelegramInlineQueryResultPhoto from './types/TelegramInlineQueryResultPhoto.js';
import TelegramUpdate from './types/TelegramUpdate.js';
import TelegramInlineQueryResultVideo from './types/TelegramInlineQueryResultVideo.js';
import type TelegramChatMember from './types/TelegramChatMember.js';

/** Class representing the context of execution */
export default class TelegramExecutionContext {
  /** an instance of the telegram bot */
  bot: TelegramBot;
  /** an instance of the telegram update */
  update: TelegramUpdate;
  /** string representing the type of update that was sent */
  update_type = '';
  /** reference to TelegramApi class */
  api = new TelegramApi();

  /**
   * Create a telegram execution context
   * @param bot - the telegram bot
   * @param update - the telegram update
   */
  constructor(bot: TelegramBot, update: TelegramUpdate) {
    this.bot = bot;
    this.update = update;

    this.update_type = this.determineUpdateType();
  }

  /**
   * Determine the type of update received
   * @returns The update type as a string
   */
  private determineUpdateType(): string {
    if (this.update.message?.photo) {
      return 'photo';
    } else if (this.update.message?.text) {
      return 'message';
    } else if (this.update.inline_query?.query) {
      return 'inline';
    } else if (this.update.message?.document) {
      return 'document';
    } else if (this.update.callback_query?.id) {
      return 'callback';
    } else if (this.update.business_message) {
      return 'business_message';
    } else if (this.update.poll) {
      return 'poll';
    } else if (this.update.poll_answer) {
      return 'poll_answer';
    }
    return '';
  }

  /**
   * Get the chat ID from the current update
   * @returns The chat ID as a string or empty string if not available
   */
  private getChatId(): string {
    if (this.update.message?.chat.id) {
      return this.update.message.chat.id.toString();
    } else if (this.update.business_message?.chat.id) {
      return this.update.business_message.chat.id.toString();
    }
    return '';
  }

  /**
   * Get the message ID from the current update
   * @returns The message ID as a string or empty string if not available
   */
  private getMessageId(): string {
    return this.update.message?.message_id.toString() ?? '';
  }

  /**
   * Resolve chat id from any supported update kind (message, business_message, callback)
   */
  private getAnyChatId(): string {
    if (this.update.message?.chat.id) {
      return this.update.message.chat.id.toString();
    }
    if (this.update.business_message?.chat.id) {
      return this.update.business_message.chat.id.toString();
    }
    if (this.update.callback_query?.message?.chat?.id) {
      return this.update.callback_query.message.chat.id.toString();
    }
    return '';
  }

  /**
   * Reply to the last message with a video
   * @param video - string to a video on the internet or a file_id on telegram
   * @param options - any additional options to pass to sendVideo
   * @returns Promise with the API response
   */
  async replyVideo(video: string, options: Record<string, number | string | boolean> = {}) {
    switch (this.update_type) {
      case 'message':
        return await this.api.sendVideo(this.bot.api.toString(), {
          ...options,
          chat_id: this.getChatId(),
          reply_to_message_id: this.getMessageId(),
          video,
        });
      case 'inline':
        return await this.api.answerInline(this.bot.api.toString(), {
          ...options,
          inline_query_id: this.update.inline_query?.id.toString() ?? '',
          results: [new TelegramInlineQueryResultVideo(video)],
        });

      default:
        return null;
    }
  }

  /**
   * Get File from telegram file_id
   * @param file_id - telegram file_id
   * @returns Promise with the file response
   */
  async getFile(file_id: string) {
    return await this.api.getFile(this.bot.api.toString(), { file_id }, this.bot.token);
  }

  /**
   * Reply to the last message with a photo
   * @param photo - url or file_id to photo
   * @param caption - photo caption
   * @param options - any additional options to pass to sendPhoto
   * @returns Promise with the API response
   */
  async replyPhoto(photo: string, caption = '', options: Record<string, number | string | boolean> = {}) {
    switch (this.update_type) {
      case 'photo':
      case 'message':
        return await this.api.sendPhoto(this.bot.api.toString(), {
          ...options,
          chat_id: this.getChatId(),
          reply_to_message_id: this.getMessageId(),
          photo,
          caption,
        });
      case 'inline':
        return await this.api.answerInline(this.bot.api.toString(), {
          inline_query_id: this.update.inline_query?.id.toString() ?? '',
          results: [new TelegramInlineQueryResultPhoto(photo)],
        });

      default:
        return null;
    }
  }

  /**
   * Send typing in a chat
   * @returns Promise with the API response
   */
  async sendTyping() {
    switch (this.update_type) {
      case 'message':
      case 'photo':
      case 'document':
        return await this.api.sendChatAction(this.bot.api.toString(), {
          chat_id: this.getChatId(),
          action: 'typing',
        });
      case 'business_message':
        return await this.api.sendChatAction(this.bot.api.toString(), {
          business_connection_id: this.update.business_message?.business_connection_id.toString() ?? '',
          chat_id: this.getChatId(),
          action: 'typing',
        });
      default:
        return null;
    }
  }

  /**
   * Reply to an inline message with a title and content
   * @param title - title to reply with
   * @param message - message contents to reply with
   * @param parse_mode - parse mode to use
   * @returns Promise with the API response
   */
  async replyInline(title: string, message: string, parse_mode = '') {
    if (this.update_type === 'inline') {
      return await this.api.answerInline(this.bot.api.toString(), {
        inline_query_id: this.update.inline_query?.id.toString() ?? '',
        results: [new TelegramInlineQueryResultArticle({ content: message, title, parse_mode })],
      });
    }
    return null;
  }

  /**
   * Reply to the last message with text
   * @param message - text to reply with
   * @param parse_mode - one of HTML, MarkdownV2, Markdown, or an empty string for ascii
   * @param options - any additional options to pass to sendMessage
   * @returns Promise with the API response
   */
  async reply(message: string, parse_mode = '', options: Record<string, number | string | boolean> = {}) {
    switch (this.update_type) {
      case 'message':
      case 'photo':
      case 'document':
        return await this.api.sendMessage(this.bot.api.toString(), {
          ...options,
          chat_id: this.getChatId(),
          reply_to_message_id: this.getMessageId(),
          text: message,
          parse_mode,
        });
      case 'business_message':
        return await this.api.sendMessage(this.bot.api.toString(), {
          chat_id: this.getChatId(),
          text: message,
          business_connection_id: this.update.business_message?.business_connection_id.toString() ?? '',
          parse_mode,
        });
      case 'callback':
        if (this.update.callback_query?.message.chat.id) {
          return await this.api.sendMessage(this.bot.api.toString(), {
            ...options,
            chat_id: this.update.callback_query.message.chat.id.toString(),
            text: message,
            parse_mode,
          });
        }
        return null;
      case 'inline':
        return await this.replyInline('Response', message, parse_mode);
      default:
        return null;
    }
  }

  async replyPoll(
    question: string,
    options: string[],
    pollOptions: Record<string, number | string | boolean> = {},
  ) {
    switch (this.update_type) {
      case 'message':
      case 'photo':
      case 'document':
        return await this.api.sendPoll(this.bot.api.toString(), {
          ...pollOptions,
          chat_id: this.getChatId(),
          reply_to_message_id: this.getMessageId(),
          question,
          options,
        });
      case 'business_message':
        return await this.api.sendPoll(this.bot.api.toString(), {
          ...pollOptions,
          chat_id: this.getChatId(),
          business_connection_id: this.update.business_message?.business_connection_id.toString() ?? '',
          question,
          options,
        });
      default:
        return null;
    }
  }

  /**
   * Stop a poll in the current chat
   * @param message_id - ID of the original poll message
   * @param reply_markup - optional new inline keyboard
   */
  async stopPoll(message_id: number, reply_markup?: object) {
    switch (this.update_type) {
      case 'message':
      case 'photo':
      case 'document':
        return await this.api.stopPoll(this.bot.api.toString(), {
          chat_id: this.getChatId(),
          message_id,
          reply_markup,
        });
      case 'business_message':
        return await this.api.stopPoll(this.bot.api.toString(), {
          chat_id: this.getChatId(),
          business_connection_id: this.update.business_message?.business_connection_id.toString() ?? '',
          message_id,
          reply_markup,
        });
      default:
        return null;
    }
  }

  /**
   * Get chat member count for the current chat
   */
  async getChatMemberCount(): Promise<number | null> {
    const chat_id = this.getAnyChatId();
    if (!chat_id) return null;
    const response = await this.api.getChatMemberCount(this.bot.api.toString(), { chat_id });
    if (!response.ok) return null;
    const json: { ok: boolean; result?: number } = await response.json();
    return json.ok && typeof json.result === 'number' ? json.result : null;
  }

  /**
   * Get list of chat administrators in the current chat
   */
  async getChatAdministrators(): Promise<TelegramChatMember[] | null> {
    const chat_id = this.getAnyChatId();
    if (!chat_id) return null;
    const response = await this.api.getChatAdministrators(this.bot.api.toString(), { chat_id });
    if (!response.ok) return null;
    const json: { ok: boolean; result?: TelegramChatMember[] } = await response.json();
    return json.ok && Array.isArray(json.result) ? json.result : null;
  }

  /**
   * Get number of users in chat excluding the bot itself.
   * Assumes the bot is a member if we are handling an update from this chat.
   */
  async getUserCountExcludingBot(): Promise<number | null> {
    const count = await this.getChatMemberCount();
    if (count == null) return null;
    return Math.max(0, count - 1);
  }
}
