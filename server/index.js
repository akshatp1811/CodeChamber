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
                files: [
                    { id: '1', name: 'main.js', type: 'file', content: '// Welcome to the Chamber\nconsole.log("Hello Chamber!");', parentId: null }
                ],
                activeFileId: '1',
                language: 'javascript',
                oracleChat: []
            };
        }

        // Send current state to joining user
        socket.emit('room-ready', roomContext[roomId]);
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
            const activeFile = roomContext[roomId].files.find(f => f.id === roomContext[roomId].activeFileId);
            const currentCode = activeFile?.content || '';
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

    socket.on('file-update', (data) => {
        const { roomId, fileId, content } = data;
        if (roomContext[roomId]) {
            roomContext[roomId].files = roomContext[roomId].files.map(f => 
                f.id === fileId ? { ...f, content } : f
            );
            socket.to(roomId).emit('file-sync', { fileId, content });
        }
    });

    socket.on('file-create', (data) => {
        const { roomId, file } = data;
        if (roomContext[roomId]) {
            roomContext[roomId].files.push(file);
            socket.to(roomId).emit('file-created', file);
        }
    });

    socket.on('file-delete', (data) => {
        const { roomId, fileId } = data;
        if (roomContext[roomId]) {
            roomContext[roomId].files = roomContext[roomId].files.filter(f => f.id !== fileId && f.parentId !== fileId);
            socket.to(roomId).emit('file-deleted', fileId);
        }
    });

    socket.on('folder-create', (data) => {
        const { roomId, folder } = data;
        if (roomContext[roomId]) {
            roomContext[roomId].files.push(folder);
            socket.to(roomId).emit('folder-created', folder);
        }
    });

    socket.on('active-file-change', (data) => {
        const { roomId, fileId } = data;
        if (roomContext[roomId]) {
            roomContext[roomId].activeFileId = fileId;
            socket.to(roomId).emit('active-file-synced', fileId);
        }
    });

    socket.on('ai-generate', async (data) => {
        const { roomId, instruction, code, language } = data;
        
        socket.emit('ai-generating', true);
        const generatedCode = await generateCodeOnly(instruction, code, language);
        socket.emit('ai-generating', false);

        socket.emit('ai-generated-code', { code: generatedCode });
    });

    socket.on('oracle-chat-query', async (data) => {
        const { roomId, question, code, language, chatHistory } = data;
        const mainContext = roomContext[roomId]?.messages.join('\n') || '';
        
        socket.emit('oracle-typing', true);
        const aiResponse = await generateAIResponse(mainContext, question, code, language, chatHistory);
        socket.emit('oracle-typing', false);

        socket.emit('oracle-chat-response', { text: aiResponse });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
