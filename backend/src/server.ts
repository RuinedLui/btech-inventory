import { createApp } from './app.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`B-TECH Inventory API: http://localhost:${PORT}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Libéralo o define otra variable PORT.`);
    process.exit(1);
  }
  throw error;
});
