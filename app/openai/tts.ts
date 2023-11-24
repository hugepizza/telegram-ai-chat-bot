import OpenAI from "openai";
import getOpenAIClient from "./_openai";

type Speech = {
  buffer: Buffer;
  mimetype: string;
  duration: number;
};

type Setting = {
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  speed: number;
};

export default async function tts(
  setting: Setting,
  text: string
): Promise<Speech> {
  const resp = await getOpenAIClient().audio.speech.create(
    {
      input: text,
      model: "tts-1",
      voice: setting.voice,
      speed: setting.speed,
      response_format: "mp3",
    },
    {
      timeout: 60000,
      maxRetries: 1,
    }
  );
  resp.type;
  const buffer = await resp.arrayBuffer();
  return {
    buffer: Buffer.from(buffer),
    mimetype: "audio/mpeg",
    duration: 1,
  };
}
