import { config } from '@/config';


async function main() {
  try {
    if (config.isDev) {
      await import('eruda').then(({ default: eruda }) => eruda.init());
    }
  } finally {
    await import('@/app.tsx');
  }
}

main().catch(console.error);
