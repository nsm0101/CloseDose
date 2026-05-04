export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Check for the API Key in your Environment Variables
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "API Key not configured in Cloudflare." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { imageBase64, mimeType } = await request.json();

    // 2. Construct the payload for Gemini 1.5 Flash
    // We use the REST API endpoint directly to avoid heavy dependencies
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

    const prompt = "Identify this enteral feeding tube device. Specify if it is an AMT Mini-One or Avanos MIC-KEY, and identify the connector type (Legacy or ENFit).";

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType || "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    };

    // 3. Fetch from Google
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // 4. Return the AI response to your frontend
    return new Response(JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
