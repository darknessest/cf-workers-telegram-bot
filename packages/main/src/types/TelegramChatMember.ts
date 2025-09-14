import TelegramUser from './TelegramUser.js';

interface TelegramChatMember {
    user: TelegramUser;
    status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked' | string;

    // Administrator fields (optional)
    can_be_edited?: boolean;
    is_anonymous?: boolean;
    can_manage_chat?: boolean;
    can_delete_messages?: boolean;
    can_manage_video_chats?: boolean;
    can_restrict_members?: boolean;
    can_promote_members?: boolean;
    can_change_info?: boolean;
    can_invite_users?: boolean;
    can_post_stories?: boolean;
    can_edit_stories?: boolean;
    can_delete_stories?: boolean;
    can_pin_messages?: boolean;
    can_manage_topics?: boolean;
    custom_title?: string;

    // Restricted member fields (optional)
    is_member?: boolean;
    can_send_messages?: boolean;
    can_send_audios?: boolean;
    can_send_documents?: boolean;
    can_send_photos?: boolean;
    can_send_videos?: boolean;
    can_send_video_notes?: boolean;
    can_send_voice_notes?: boolean;
    can_send_polls?: boolean;
    can_send_other_messages?: boolean;
    can_add_web_page_previews?: boolean;
    until_date?: number;
}

export default TelegramChatMember;


