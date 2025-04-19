// Polyfill for global crypto (required by Baileys)
const { Crypto } = require('@peculiar/webcrypto');
global.crypto = new Crypto();

const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/pair', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Missing phone number' });
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(`auth/${phoneNumber}`);

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ['Xason XtarmD Pairing Bot', 'Linux', '4.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.once('connection.update', async (update) => {
      const { pairingCode } = update;
      if (pairingCode) {
        return res.json({ code: pairingCode });
      } else {
        return res.status(428).json({ error: 'Failed to generate pairing code' });
      }
    });

  } catch (error) {
    console.error('Error generating pairing code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
