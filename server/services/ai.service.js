import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

export const generateAIResponse = async (context, question, code, language, chatHistory = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const historyContext = chatHistory.map(m => `${m.sender === 'user' ? 'User' : 'The Oracle'}: ${m.text}`).join('\n');

        const prompt = `
        You are an advanced AI coding assistant named "The Oracle" integrated into a collaborative coding environment called "CodeChamber".
        
        Main Room Context (recent chat):
        ${context}

        Oracle Direct Conversation History:
        ${historyContext}

        Current Code (${language}):
        \`\`\`${language}
        ${code}
        \`\`\`

        New User Question: ${question}

        Requirements:
        1. Format your response cleanly using Markdown.
        2. Separate explanations from code suggestions.
        3. Highlight line numbers explicitly if referencing the provided code.
        4. If the user asks to debug, explain the cause of the error clearly.
        5. If the user asks to improve code, provide the optimized version.
        6. Keep the tone helpful, professional, and slightly mystical (fitting "The Oracle" persona).
        7. If this is a follow-up question, use the context from the conversation history.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Service Error:", error);
        return "I apologize, but my mystic energies are currently disrupted. Please check my API Key connection.";
    }
};

export const generateCodeOnly = async (instruction, code, language) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an AI code generator. 
        Instruction: ${instruction}
        Language: ${language}
        Current Context:
        \`\`\`${language}
        ${code}
        \`\`\`

        Requirements:
        1. Output ONLY the code.
        2. DO NOT include any explanations, markdown headers, or surrounding text.
        3. Ensure the code is valid and follows the specified language syntax.
        4. If improving code, return the full corrected snippet.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if the AI accidentally included them
        text = text.replace(/```[\s\S]*?\n/g, '').replace(/```/g, '').trim();

        return text;
    } catch (error) {
        console.error("AI Code Gen Error:", error);
        return "// The Oracle failed to generate code. Please try again.";
    }
};
