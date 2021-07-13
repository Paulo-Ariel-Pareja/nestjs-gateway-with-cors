import { registerAs } from '@nestjs/config';

export default registerAs('redisConfig', () => ({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || '7001',
}));