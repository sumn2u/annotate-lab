import { exec } from 'child_process';

const vite = exec('npx vite');

vite.stdout.on('data', (data) => {
  console.log(data.toString());
});

vite.stderr.on('data', (data) => {
  console.error(data.toString());
});

process.on('SIGINT', () => {
  console.log('Killing Vite process');
  vite.kill('SIGINT');
  process.exit();
});
