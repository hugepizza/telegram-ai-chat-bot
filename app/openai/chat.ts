import getOpenAIClient from "./_openai";

export type Message = {
  role: "system" | "user" | "assistant";
  text: string;
};
export default async function chat(messages: Message[]) {
  console.log(messages);

  const resp = await getOpenAIClient().chat.completions.create({
    messages: messages.map((ele) => ({ role: ele.role, content: ele.text })),
    model: "gpt-3.5-turbo",
    stream: false,
  });
  return resp.choices[0].message.content;
}
