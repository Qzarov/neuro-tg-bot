import { Message } from 'node-telegram-bot-api'

function isGroupMessage(message: Message): boolean {
  return message.chat.type === 'group' || message.chat.type === 'supergroup';
}

function isPrivateMessage(message: Message): boolean {
  return message.chat.type === 'private';
}

export {
  isGroupMessage,
  isPrivateMessage,
}