import { registerAs } from '@nestjs/config';

const buildUri = (returnOption: 'string' | 'object' = 'string') => {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }
  const uri = {
    protocol: process.env.MONGO_PROTOCOL || 'mongodb',
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || '27017',
    user: process.env.MONGO_USER || '',
    pass: process.env.MONGO_PASS || '',
    db: process.env.MONGO_DATABASE || 'notifications',
  };
  if (returnOption === 'string') {
    const userInfo = !!uri.user && !!uri.pass ? `${uri.user}:${uri.pass}@` : '';
    return `${uri.protocol}://${userInfo}${uri.host}:${uri.port}/${uri.db}`;
  }
  return uri;
};

export default registerAs('dbConfig', () => ({
  uri: buildUri(),
}));