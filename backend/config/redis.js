const { createClient } = require('redis');

const redis = createClient();

redis.connect().then(() => console.log('Redis connected')).catch(console.error);

module.exports = redis;
