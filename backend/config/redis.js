const { createClient } = require('redis');

const redis = createClient({
  socket: {
    host: 'localhost',
    port: process.env.REDIS_PORT || 6379,
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
