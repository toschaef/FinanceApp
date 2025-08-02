const { createClient } = require('redis');

const redis = createClient({
  socket: {
    host: 'localhost',
    port: process.env.REDIS_PORT || 6379,
    connectTimeout: 100000, // very, very slow
  }
});

try {
  redis.connect();
  console.log('Redis connected');
} catch (err) {
  console.log(`Redis startup error: ${err.message}`)
}

module.exports = redis;
