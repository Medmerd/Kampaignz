export const sendMessageToDiscord = async (content: string) => {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error('Message is required before sending to Discord.');
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('DISCORD_WEBHOOK_URL is not set.');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: trimmedContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord request failed: ${response.status} ${errorText}`);
  }
};
