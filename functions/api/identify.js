export const onRequestPost = async (context) => {
  const { request, env } = context;

  // 1. Get the API Key from Cloudflare Environment Variables
  const API_KEY = env.GEMINI_API_KEY; 
  const MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image data provided" }), { status: 400 });
    }

    // 2. Construct the Gemini Payload
    const payload = {
      contents: [{
        parts: [
          { text: "Identify this enteral feeding device. Return JSON with keys: Brand, Type (G or GJ), Connector (EnFit/Legacy), and Features." },
          { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
        ]
      }],
      generationConfig: { 
        response_mime_type: "application/json" 
      }
    };

    const response = await fetch(MODEL_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    // Return the AI's response to your frontend
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server Error", details: error.message }), { status: 500 });
  }
};
