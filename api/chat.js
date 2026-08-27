const SYSTEM_PROMPT = `You are a warm, highly refined luxury AI Concierge for VEDHA Traditions, a ultra-premium Seeru Plate, Wedding Hamper, Return Gift, and Doorstep Bridal Decor studio based in Tamil Nadu.

About VEDHA:
- Philosophy: Preserving Tamil heritage with Sabyasachi & Tanishq inspired luxury aesthetics
- Phone / WhatsApp: +91 9791014662
- Services: Handcrafted Royal Seeru Plates, Engagement Hampers, Return Gifts, Doorstep HD Bridal Makeup, Poo Veni Hair Art
- Locations: Chennai, Madurai, Coimbatore, Tiruppur, Salem, Trichy & across Tamil Nadu

Collections & Pricing:
- Royal Seeru Plates: ₹1,200 - ₹25,000 (Custom Velvet, Brass & Silver Plated Sets)
- Bridal Makeup Packages: Essential (₹2,500), Signature Kalyanam (₹4,500), Royal Empress (₹7,500)
- Return Gifts: ₹250 - ₹1,500 per piece (Custom Brass Kumkum Boxes, Silk Bags, Silver Coins)

Tone: Elegant, polite, respectful, mixing English with Tamil honorifics (Vanakkam, Vanakkam Ayya/Amma, Nandri). Keep responses concise, helpful, and direct customers to WhatsApp 9791014662 for bespoke bookings.`;

function getSmartFallbackReply(userMessage) {
  const query = userMessage.toLowerCase();

  if (query.includes('seeru') || query.includes('plate') || query.includes('fruit') || query.includes('sweet') || query.includes('thattu')) {
    return "Vanakkam! 🌸 VEDHA crafts exquisite Tamil Nadu Seeru Plates starting from ₹1,200 up to grand ₹25,000 Royal Brass & Silver Sets. Explore our live Thattu Store or customize your set! Would you like to reserve via WhatsApp (+91 97910 14662)?";
  }
  if (query.includes('makeup') || query.includes('bridal') || query.includes('beauty') || query.includes('price') || query.includes('cost') || query.includes('rate')) {
    return "Vanakkam! 💄 VEDHA Doorstep HD Bridal Makeup packages start from ₹2,500 (Essential), ₹4,500 (Signature Kalyanam), to ₹7,500 (Royal Empress Suite). Includes 100% organic Madurai Jasmine Poo Veni hair art and saree draping. Shall we check date availability?";
  }
  if (query.includes('home') || query.includes('visit') || query.includes('location') || query.includes('coimbatore') || query.includes('chennai') || query.includes('madurai')) {
    return "Vanakkam! 🏛️ VEDHA provides doorstep venue setup and bridal services across Chennai, Madurai, Coimbatore, Salem, Tiruppur, and all districts of Tamil Nadu. Contact our atelier directly at +91 97910 14662!";
  }
  if (query.includes('book') || query.includes('contact') || query.includes('whatsapp') || query.includes('phone') || query.includes('number')) {
    return "Vanakkam! 🌸 You can easily connect with our luxury wedding consultants via WhatsApp at +91 97910 14662 or click the WhatsApp buttons on our platform. Nandri!";
  }
  return "Vanakkam! 🪷 Welcome to VEDHA Traditions. We craft bespoke Tamil Wedding Seeru Plates, Luxury Hampers, Return Gifts, and Doorstep HD Bridal Makeup. How may I assist your celebration today?";
}

function getLastUserMessage(messages) {
  if (!Array.isArray(messages)) return '';
  const lastMessage = messages[messages.length - 1];
  return lastMessage && typeof lastMessage.content === 'string' ? lastMessage.content : '';
}

module.exports = async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.status(204).end();
  }
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const messages = request.body && request.body.messages;
  const lastUserMessage = getLastUserMessage(messages);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here' || !Array.isArray(messages)) {
    return response.status(200).json({ content: [{ type: 'text', text: getSmartFallbackReply(lastUserMessage) }] });
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, system: SYSTEM_PROMPT, messages })
    });
    const data = await anthropicResponse.json();
    if (data.content) return response.status(200).json(data);
  } catch (error) {
    console.error('Anthropic API error:', error);
  }

  return response.status(200).json({ content: [{ type: 'text', text: getSmartFallbackReply(lastUserMessage) }] });
}