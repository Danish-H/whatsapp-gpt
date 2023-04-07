const config = require("./config.json");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    organization: config.OPENAI_ORG,
    apiKey: config.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const getText = async function(messages, model="gpt-3.5-turbo") {
    try {
        console.log("[!] Starting text generation...")
        const response = await openai.createChatCompletion({
            model: model,
            messages: messages
        });
        await console.log("[!] Finished text generation!")
        return {
            response: response.data.choices[0].message,
            tokens: response.data.usage.total_tokens,
            completion_tokens: response.data.usage.completion_tokens
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
