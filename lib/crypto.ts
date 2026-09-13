import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

function getMasterKey(): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
  }
  return Buffer.from(encryptionKey, 'utf-8');
}

function deriveUserKey(userId: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    Buffer.concat([getMasterKey(), Buffer.from(userId)]),
    salt,
    100000,
    KEY_LENGTH,
    'sha512'
  );
}

export function encrypt(plaintext: string, userId: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveUserKey(userId, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return [salt.toString('hex'), iv.toString('hex'), tag.toString('hex'), encrypted].join(':');
}

export function decrypt(ciphertext: string, userId: string): string {
  const parts = ciphertext.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid ciphertext format');
  }

  const [saltHex, ivHex, tagHex, encrypted] = parts;
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const key = deriveUserKey(userId, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
