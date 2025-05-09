// src/config/env.ts
import * as dotenv from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

const envPath = join(__dirname, '../../.env'); // Adjust path for src/config/

if (!existsSync(envPath)) {
  console.error(`.env file not found at: ${envPath}`);
  process.exit(1);
}

dotenv.config({ path: envPath });

// Validate critical environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Critical environment variables missing: EMAIL_USER or EMAIL_PASS not set');
  process.exit(1);
}

// Debug logs
console.log('ENV Path:', envPath);
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'undefined');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[REDACTED]' : 'undefined');
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'undefined');
console.log('PORT:', process.env.PORT || 'undefined');