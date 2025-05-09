import * as dotenv from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

const envPath = join(__dirname, '../../.env');

if (!existsSync(envPath)) {
  console.error(`.env file not found at: ${envPath}`);
  process.exit(1);
}

dotenv.config({ path: envPath });

// Debug logs
console.log('ENV Path:', envPath);
console.log('MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? '[REDACTED]' : 'undefined');
console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN || 'undefined');
console.log('MAIL_ID:', process.env.MAIL_ID || 'undefined');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'undefined');
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'undefined');
console.log('PORT:', process.env.PORT || 'undefined');