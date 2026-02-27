import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateAIResponse, generateCodeOnly } from './services/ai.service.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Room context storage (in-memory persistent for this session)
const roomContext = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
        
        if (!roomContext[roomId]) {
            roomContext[roomId] = {
                messages: [],
                code: '',
                language: 'javascript'
            };
        }
    });

    socket.on('send-message', async (data) => {
        const { roomId, message, user } = data;
        
        // Add to room context (keep last 20)
        if (!roomContext[roomId]) roomContext[roomId] = { messages: [] };
        roomContext[roomId].messages.push(`${user}: ${message}`);
        if (roomContext[roomId].messages.length > 20) {
            roomContext[roomId].messages.shift();
        }

        // Broadcast message to everyone in room
        io.to(roomId).emit('receive-message', {
            id: Date.now(),
            user,
            text: message,
            isOracle: false
        });

        // Trigger AI if it starts with @AI
        if (message.startsWith('@AI')) {
            const question = message.replace('@AI', '').trim();
            const contextString = roomContext[roomId].messages.join('\n');
            const currentCode = roomContext[roomId].code || '';
            const language = roomContext[roomId].language || 'javascript';

            // Show typing indicator
            io.to(roomId).emit('oracle-typing', true);

            const aiResponse = await generateAIResponse(contextString, question, currentCode, language);

            io.to(roomId).emit('oracle-typing', false);
            io.to(roomId).emit('receive-message', {
                id: Date.now() + 1,
                user: 'Oracle',
                text: aiResponse,
                isOracle: true
            });
        }
    });

    socket.on('code-update', (data) => {
        const { roomId, code, language } = data;
        if (roomContext[roomId]) {
            roomContext[roomId].code = code;
            roomContext[roomId].language = language;
        }
        // Broadcast code change to others
        socket.to(roomId).emit('code-sync', { code, language });
    });

    socket.on('ai-generate', async (data) => {
        const { roomId, instruction, code, language } = data;
        
        socket.emit('ai-generating', true);
        const generatedCode = await generateCodeOnly(instruction, code, language);
        socket.emit('ai-generating', false);

        socket.emit('ai-generated-code', { code: generatedCode });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
