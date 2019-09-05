module.exports = {
    SAMPLE_MARKDOWN: `*bold text*
_italic text_
[inline URL](http://www.example.com/)
[inline mention of a user](tg://user?id:123456789)` +
        "`inline fixed-width code`" +
        "```block_language" +
        "pre-formatted fixed-width code block" +
        "```",
    ALERT_MORTAL_REGISTER: "Your mortal just started using the bot! You can now message them by typing `/m <message>`",
    ALERT_ANGEL_REGISTER: "Your angel just started using the bot! You can now message them by typing `/a <message>`",
    USAGE_REGISTER: "`/register code`",
    ERROR_ALREADY_REGISTERED: "This room number has already been registered. If it wasn't you, please contact someone.",
    ERROR_INVALID_ROOM_NUMBER: "Invalid room number",
    ERROR_INVALID_CODE: "Invalid code",
    ERROR_USER_NOT_IN_GAME: "Never sign up",
    SUCCESS_MESSAGE: "Registered successfully!",
    WELCOME_MESSAGE: "Welcome! \nRegister by typing `/register code`\nTalk to your mortal by typing `/m <message>`\nTalk to your angel by typing `/a <message>`\nFor example:\n`/register ABCD`\n`/a hello nice to meet u!`",
    PLEASE_REGISTER: "Please register first by typing \n`/register code\`",
    SENT_ANGEL_RECEIPT: "Sent to angel",
    SENT_MORTAL_RECEIPT: "Sent to mortal",
    ANGEL_PREFIX: "Angel:",
    MORTAL_PREFIX: "Mortal:",
    ANGEL_NOT_REGISTERED: "Your angel hasn't registered on telegram yet",
    MORTAL_NOT_REGISTERED: "Your mortal hasn't registered on telegram yet",
    STARTUP_MSG: "HELLO WORLD!",
    FAILED_TO_SEND: "Your message has failed to send",
    PHOTO_CAPTION_REQUIRED: "Send a photo with /a to send it to your angel and /m to send it to your mortal"
};
