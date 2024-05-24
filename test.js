import { isUserInChat } from './utils/actions/chatActions.js';

const userId = 'UNAhRUEewZNfTnxuBXWyuW6kJle2'; 
const invitationLink = '24882a23-efc5-4fd5-bf96-b0ec1007c991';

const userInChat = await isUserInChat(userId, invitationLink);

console.log('Is user in chat?', userInChat);

console.log("hhh");

