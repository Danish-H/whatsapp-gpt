const config = require("./config.json");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

const getText = async function(messages, model="gpt-3.5-turbo", max_tokens=Infinity) {
    try {
        console.log("[!] Starting text generation...")
        const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: max_tokens
        });
        await console.log("[!] Finished text generation!")
        console.log(response.choices[0])
        return {
            response: response.choices[0].message,
            tokens: response.usage.total_tokens,
            completion_tokens: response.usage.completion_tokens
        }
    } catch(error) {
        if (error.response) console.error(error.response.status, error.response.data);
        else console.error(`Error with OpenAI API request: ${error.message}`);
        return { error }
    }
}

const getImage = async function(dallePrompt, size="256x256") {
    try {
        console.log("[!] Starting image generation...")
        const response = await openai.createImage({
            prompt: dallePrompt,
            n: 1,
            size: size,
        });
        await console.log("[!] Finished image generation!")
        return { image_url: response.data.data[0].url }
    } catch(error) {
        if (error.response) console.error(error.response.status, error.response.data);
        else console.error(`Error with OpenAI API request: ${error.message}`);
        return { error }
    }
}

module.exports = {
    getText,
    getImage
}
