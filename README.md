# WhatsAppGPT

This is a simple Discord-style bot written for WhatsApp which works with OpenAI API. This bot is heavily integrated with WhatsApp and allows using ChatGPT features while keeping in context things like the user's information and the message they have replied to.

There is a customizable humanized delay in responses to prevent overwhelming WhatsApp's automated messaging detection. The goal is to make it slow enough that it could be equivalent to a user manually copying and pasting responses, so it has no unintended effect on WhatsApp's services.

Please note that this code is only meant for educational purposes, and any use of it must comply with the terms of service of WhatsApp, OpenAI, and any other involved.

## Features

### Commands
| Syntax                          | Description                                             |
| :------------------------------ | :------------------------------------------------------ |
| **help**                        | Display a list of all commands                          |
| **transcribe**                  | Transcribe a voice note by replying to it               |
| **gpt3** \<prompt\>             | Get a response from OpenAI's gpt-3.5-turbo              |
| **gpt4** \<prompt\>             | Get a response from OpenAI's gpt-4                      |
| **reply** \<prompt\>            | Continue an on-going conversation with gpt3 or gpt4     |
| **summarize**                   | Summarize the message replied to                        |
| **poem**                        | Generate a poem of the message replied to               |
| **tldr**                        | Generate reddit-like tl;dr of message replied to        |
| **dalle** \[size\] \<prompt\>   | Generate an image using DALL·E of a given size          |
| **diffuse** \[size\] \<prompt\> | Generate an image using stable diffusion webui          |
| **sticker**                     | Turn an image/video into a sticker in-chat              |
| **sticker** \<prompt\>          | Generate a sticker given a prompt                       |
| **qsticker**                    | Create 2x2 grid sticker of the image/sticker replied to |
| **catsticker**                  | Generate a random cat sticker using public api          |
| **yt** \[v\|a\|s\] \<link\>     | Get YouTube video from link as video, audio or sticker  |
| **reload**                      | Reload commands without stopping bot                    |
| **purge** \<num\>               | Delete given number of messages in a group              |
| **debug**                       | Print useful information                                |
| **stop**                        | Stop the bot                                            |

### Triggers
The existence of certain keywords can trigger events. For example, if the word 'fire' is present in any message, the bot can react to it with the fire emoji.

## Requirements
- whatsapp-web.js@1.19.5
- qrcode-terminal@0.12.0
- openai@3.2.1 (required for gpt3, gpt4, dalle, transcribe, etc.)
- sharp@0.32.0 (required for qsticker)
- color@4.2.3 (required for qsticker)
- stable-diffusion-api@0.0.5 (required for diffuse)

## Configuration
To run the bot, you must create a file called `config.json` in the root directory with content similar to the example below.
```json
{
    "OPENAI_ORG": "",
    "OPENAI_API_KEY": "",
    "chrome": "/usr/bin/google-chrome-stable",
    "ytdl": "yt-dlp",
    "prefix": "!",
    "sdwebui": {
        "host": "127.0.0.1",
        "port": "7860",
        "negative_prompt": "",
        "nsfw_prompt": ""
    },
    "dm": {
        "enabled": true,
        "trigger": "Bot",
        "humanize": true,
        "history_length": 15,
        "max_tokens": 2500,
        "initial_prompt": ""
    },
    "naturalDelay": {
        "min": 1,
        "max": 3
    },
    "enabled_commands": [
        "gpt3",
        "gpt4",
        "reply",
        "clear",
        "help",
        "dalle",
        "sticker"
    ],
    "enabled_triggers": [
        "fire"
    ],
    "ops": [],
    "whitelist": [],
    "error": "There was an error! Please try again later.",
    "initial_prompt": "You are WhatsAppGPT bot written by Danish Humair."
}
```
