import { json } from '@/lib/http';
import { aiCapabilities } from '@/lib/ai/provider';
export async function GET() {
  return json(aiCapabilities);
}
export async function POST() {
  return json(
    {
      error: 'AI_NOT_CONFIGURED',
      message: '本版本不接入 OpenAI，基础功能不调用模型。',
    },
    501,
  );
}
