# WhatsAppGPT

This is a simple Discord-style bot written for WhatsApp which works with OpenAI API.

Please note that this code is only meant for educational purposes, and any use of it must comply with the terms of service of WhatsApp, OpenAI, and any other involved.

## Features

### Commands
- **help** - display a list of all commands
- **gpt3 \<prompt\>** - get a response from OpenAI's gpt-3.5-turbo
- **gpt4 \<prompt\>** - get a response from OpenAI's gpt-4
- **reply \<prompt\>** - continue an on-going conversation with gpt3 or gpt4
- **dalle \[256|512|1024\] \<prompt\>** - generate an image using DALL·E of a given size
- **sticker** - turn an image into a sticker in-chat
- **sticker \<prompt\>** - generate a sticker given a prompt

### Triggers
The existence of certain keywords can trigger events. For example, if the word 'fire' is present in any message, the bot can react to it with the fire emoji.

## Requirements
- openai@3.2.1
- qrcode-terminal@0.12.0
- whatsapp-web.js@1.19.5

## config.json
```json
{
    "OPENAI_ORG": "",
    "OPENAI_API_KEY": "",
    "prefix": "!",
    "enabled_commands": ["gpt3", "gpt4", "reply", "help", "dalle", "sticker"],
    "enabled_triggers": ["fire"],
    "whitelist": [],
    "error": "There was an error! Please try again later.",
    "initial_prompt": "You are WhatsAppGPT bot written by Danish Humair."
}
```
