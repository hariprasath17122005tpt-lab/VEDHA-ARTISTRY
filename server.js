require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

// Intelligent fallback AI engine when offline or no API key
function getSmartFallbackReply(userMessage) {
  const q = userMessage.toLowerCase();
  
  if (q.includes('seeru') || q.includes('plate') || q.includes('fruit') || q.includes('sweet') || q.includes('thattu')) {
    return "Vanakkam! 🌸 VEDHA crafts exquisite Tamil Nadu Seeru Plates starting from ₹1,200 up to grand ₹25,000 Royal Brass & Silver Sets. Explore our live Thattu Store or customize your set! Would you like to reserve via WhatsApp (+91 95972 44055)?";
  }
  
  if (q.includes('makeup') || q.includes('bridal') || q.includes('beauty') || q.includes('price') || q.includes('cost') || q.includes('rate')) {
    return "Vanakkam! 💄 VEDHA Doorstep HD Bridal Makeup packages start from ₹2,500 (Essential), ₹4,500 (Signature Kalyanam), to ₹7,500 (Royal Empress Suite). Includes 100% organic Madurai Jasmine Poo Veni hair art and saree draping. Shall we check date availability?";
  }
  
  if (q.includes('home') || q.includes('visit') || q.includes('location') || q.includes('coimbatore') || q.includes('chennai') || q.includes('madurai')) {
    return "Vanakkam! 🏛️ VEDHA provides doorstep venue setup and bridal services across Chennai, Madurai, Coimbatore, Salem, Tiruppur, and all districts of Tamil Nadu. Contact our atelier directly at +91 95972 44055!";
  }
  
  if (q.includes('book') || q.includes('contact') || q.includes('whatsapp') || q.includes('phone') || q.includes('number')) {
    return "Vanakkam! 🌸 You can easily connect with our luxury wedding consultants via WhatsApp at +91 95972 44055 or click the WhatsApp buttons on our platform. Nandri!";
  }
  
  return "Vanakkam! 🪷 Welcome to VEDHA Traditions. We craft bespoke Tamil Wedding Seeru Plates, Luxury Hampers, Return Gifts, and Doorstep HD Bridal Makeup. How may I assist your celebration today?";
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : '';

    if (!apiKey || apiKey === 'your_api_key_here') {
      const fallbackText = getSmartFallbackReply(lastUserMsg);
      return res.json({
        content: [{ type: 'text', text: fallbackText }]
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();
    if (data.content) {
      res.json(data);
    } else {
      res.json({
        content: [{ type: 'text', text: getSmartFallbackReply(lastUserMsg) }]
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    const lastUserMsg = req.body.messages && req.body.messages.length > 0 ? req.body.messages[req.body.messages.length - 1].content : '';
    res.json({
      content: [{ type: 'text', text: getSmartFallbackReply(lastUserMsg) }]
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n👑 VEDHA Luxury Traditions server running at http://localhost:${PORT}\n`);
});
