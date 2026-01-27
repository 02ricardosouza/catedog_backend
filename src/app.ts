import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import interactionRoutes from './routes/interactionRoutes';
import adminRoutes from './routes/adminRoutes';
import tagRoutes from './routes/tagRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/tags', tagRoutes);
app.use('/users', userRoutes);
app.use('/', interactionRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/', (req, res) => {
    res.send('ANIMAL Blog Shared API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
