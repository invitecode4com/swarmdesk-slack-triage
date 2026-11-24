export default defineComponent({
  async run({ steps, $ }) {
    await $.respond({
      immediate: true,
      status: 200,
      body: "",
    });

    const rawBody = steps.trigger.event.body || {};
    const params =
      typeof rawBody === "string"
        ? Object.fromEntries(new URLSearchParams(rawBody))
        : rawBody;

    const channelId = params.channel_id;
    const rawText = (params.text || "").trim();
    const userId = params.user_id || "";
    const channelName = params.channel_name || "channel";

    if (!channelId) return;

    const sevMatch = rawText.match(/\b(P[1-3])\b/i);
    const severity = sevMatch ? sevMatch[1].toUpperCase() : "P2";

    const sevConfig = {
      P1: { badge: "🔴 P1 — CRITICAL", sla: "15 min response", step: "Assign incident lead & post update in 10m" },
      P2: { badge: "🟠 P2 — HIGH", sla: "2 hour response", step: "Reproduce bug & link logs in thread" },
      P3: { badge: "🟡 P3 — NORMAL", sla: "Next business day", step: "Add to backlog & confirm scope" },
    }[severity];

    const ownerMatch = rawText.match(/(<@[^>]+>|@[a-zA-Z0-9._-]+)/);
    const owner = ownerMatch ? ownerMatch[1] : (userId ? `<@${userId}>` : "Unassigned");

    const summary =
      rawText
        .replace(/\bP[1-3]\b/i, "")
        .replace(/(<@[^>]+>|@[a-zA-Z0-9._-]+)/, "")
        .replace(/\s+/g, " ")
        .trim() || "General triage check-in";

    const ticketId = `SWM-${Math.floor(1000 + Math.random() * 9000)}`;
    const reportedBy = userId ? `<@${userId}>` : (params.user_name || "teammate");
    const utcTime = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

    const blocks =
      !rawText || rawText.toLowerCase() === "help"
        ? [
            {
              type: "header",
              text: { type: "plain_text", text: "SwarmDesk — Quick Usage Guide", emoji: true },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text:
                  "*Format:* `/triage [P1|P2|P3] [issue summary] [@owner]`\n\n" +
                  "*Example:* `/triage P1 Checkout API returning 502 @alex`",
              },
            },
          ]
        : [
            {
              type: "header",
              text: { type: "plain_text", text: `⚡ SwarmDesk Triage • ${ticketId}`, emoji: true },
            },
            {
              type: "section",
              text: { type: "mrkdwn", text: `*Issue:* ${summary}` },
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Severity*\n${sevConfig.badge}` },
                { type: "mrkdwn", text: `*Owner*\n${owner}` },
                { type: "mrkdwn", text: `*SLA Target*\n${sevConfig.sla}` },
                { type: "mrkdwn", text: `*Status*\n🟢 Active Triage` },
              ],
            },
            { type: "divider" },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*First Response Checklist:*\n• ${sevConfig.step}\n• Reply in this thread to keep \`#${channelName}\` clean`,
              },
            },
            {
              type: "context",
              elements: [
                { type: "mrkdwn", text: `Logged by ${reportedBy} • ${utcTime} • SwarmDesk` },
              ],
            },
          ];

    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: channelId,
        text: `[${ticketId}] ${severity}: ${summary}`,
        blocks,
      }),
    });
  },
});
