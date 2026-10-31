import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcryptjs';
import { database } from './database.js';

function readHiddenPassword(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('Run this command in an interactive terminal to create an admin account.');
  }

  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.setEncoding('utf8');
  stdin.resume();

  return new Promise((resolve, reject) => {
    let password = '';
    const finish = (error) => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      error ? reject(error) : resolve(password);
    };
    const onData = chunk => {
      for (const character of chunk) {
        if (character === '\u0003') return finish(new Error('Admin creation cancelled.'));
        if (character === '\r' || character === '\n') return finish();
        if (character === '\u007f' || character === '\b') {
          password = [...password].slice(0, -1).join('');
          continue;
        }
        if (character >= ' ' && character !== '\u007f') password += character;
      }
    };
    stdin.on('data', onData);
  });
}

try {
  const readline = createInterface({ input: stdin, output: stdout });
  const email = (await readline.question('Admin email: ')).trim().toLowerCase();
  readline.close();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');

  const password = await readHiddenPassword('Admin password (12–72 bytes, input hidden): ');
  if (Buffer.byteLength(password, 'utf8') < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Password must be between 12 and 72 bytes.');
  }
  const confirmation = await readHiddenPassword('Confirm admin password: ');
  if (password !== confirmation) throw new Error('Passwords did not match. No account changes were made.');

  const passwordHash = await bcrypt.hash(password, 12);
  database.prepare(`
    INSERT INTO admin_users (email, password_hash) VALUES (?, ?)
    ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash
  `).run(email, passwordHash);
  console.log('Admin account created or password updated.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  database.close();
}
