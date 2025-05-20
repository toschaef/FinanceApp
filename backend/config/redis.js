const { createClient } = require('redis');

const redis = createClient({
  socket: {
    host: 'localhost',
    port: 6379,
    connectTimeout: 10000, // very slow
  }
});

redis.connect().then(() => console.log('Redis connected')).catch(console.error);

module.exports = redis;
