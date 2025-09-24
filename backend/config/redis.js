const { createClient } = require('redis');

const redis = createClient({
  socket: {
    host: process.env.VITE_USE_DOCKER === 'true' ? process.env.REDIS_HOST : 'localhost',
    port: process.env.REDIS_PORT,
    connectTimeout: 10000, // very, very slow
  }
});

redis.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await redis.connect();
    console.log('Redis connected');
  } catch (err) {
    console.error(`Redis startup error: ${err.message}`);
  }
})();

module.exports = redis;
