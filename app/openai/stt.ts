import { Uploadable } from "openai/uploads";
import getOpenAIClient from "./_openai";

export default async function stt(content: Uploadable) {
  const resp = await getOpenAIClient().audio.transcriptions.create({
    file: content,
    model: "whisper-1",
  });
  return resp.text;
}
