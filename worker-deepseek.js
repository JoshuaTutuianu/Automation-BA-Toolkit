export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      const API_KEY = env.DEEPSEEK_API_KEY;
      if (!API_KEY) throw new Error("DEEPSEEK_API_KEY not found in Cloudflare Variables.");

      const targetUrl = "https://api.deepseek.com/v1/chat/completions";

      const body = await request.json();

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // If DeepSeek returns an error, pass it through clearly
      if (!response.ok || data.error) {
        return new Response(JSON.stringify({
          error: {
            message: data.error?.message || `DeepSeek API returned status ${response.status}`,
            status: response.status,
            details: data.error || data
          }
        }), {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: { message: `Worker Error: ${err.message}` } }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }
};
