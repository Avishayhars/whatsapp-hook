// ===== EXISTING WHATSAPP WEBHOOK CODE =====
const express = require('express');
const app = express();

// Middleware to parse JSON bodies (WhatsApp)
app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// WhatsApp Webhook Verification
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// WhatsApp Webhook Listener
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});


// ===== ADD WIX WEBHOOK SUPPORT (MINIMAL REQUIRED CODE) =====
import { AppStrategy, createClient } from "@wix/sdk";
import { appInstances } from "@wix/app-management";

// Your Wix App Public Key
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7cn6ZaGD8fQs3RYvfpb0
5YvPizw9DFfJkKkmHWc5pJFeMOeIP9zfhcEOS0dG23bX21vkfx8SW6WytNVk7kg7
YSoBYIk1rLo8FAV0eS3SQJr6P8H27vjYhGuCqghuHgIoj1rbJGe2CQWFUyV/qnKM
tkRs5j2KnCvcpyE4eE75r+TjRK2e7/mZg/Vz9TDWpLT1Xg4SGu5dpgOBAQ2Ethq5
YDO5F8+jJKZP91INrehS0kWtKlFzwPYh01vLDDvgtbnnTpcmE88z1fs6hErhWv1Z
XGVUDv+8wsjMsfKDlGulkWgKKP1HcHmR7uWL2HHCLXPwr7wpxFHl0R65RWaehM4U
7QIDAQAB
-----END PUBLIC KEY-----`;

const APP_ID = "c9903086-07e9-4af7-96cc-4133e5d1ff57";

// Create Wix client
const client = createClient({
  auth: AppStrategy({
    appId: APP_ID,
    publicKey: PUBLIC_KEY,
  }),
  modules: { appInstances },
});

// Register Wix event listener
client.appInstances.onAppInstanceInstalled((event) => {
  console.log("Wix App Installed:", event);
});

// Required: Wix webhook must receive raw text, so override only this route
app.post("/webhook", express.text(), async (req, res) => {
  try {
    await client.webhooks.process(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Wix webhook error:", err);
    res.status(500).send("Webhook error");
  }
});


// ===== START SERVER =====
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
