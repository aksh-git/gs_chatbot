import { OpenAI } from "openai"
import dotenv from 'dotenv';

dotenv.config();

// OpenAI API configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export {
    openai
}