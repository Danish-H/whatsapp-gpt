# WhatsAppGPT

This is a simple Discord-style bot written for WhatsApp which works with OpenAI API.

Please note that this code is only meant for educational purposes, and any use of it must comply with the terms of service of WhatsApp, OpenAI, and any other involved.

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
    "enabled_commands": ["gpt3", "gpt4", "help", "dalle", "sticker"],
    "enabled_triggers": ["fire"],
    "whitelist": [],
    "error": "There was an error! Please try again later.",
    "initial_prompt": "You are WhatsAppGPT bot written by Danish Humair."
}
```
