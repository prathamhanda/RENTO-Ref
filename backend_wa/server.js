const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
  downloadMediaMessage,
  Mimetype,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const qrcode = require("qrcode");
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
// const pino = require('pino');
//const {phoneNumberFormatter} = require('./helpers/formatter');
const axios = require("axios");
const path = require("path");

// Initialize Pino logger
// const logger = pino({ level: 'debug' }); // Set to 'debug' for more detailed logs

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3001;

// Utility function to format phone numbers (important)
const getJid = (phone) => {
  phone = phone.toString();
  if (!phone.endsWith("@s.whatsapp.net")) {
    if (phone.length === 10) phone = "91" + phone; // Add country code if needed
    phone += "@s.whatsapp.net"; // Add WhatsApp suffix
  }
  return phone;
};

// WhatsApp connection
let sockClient = null;
let qrCode = null;

const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(
    "auth_info_goyalinfocom3"
  );
  sockClient = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    browser: Browsers.macOS("Desktop"), // Optional: Emulate desktop app
    syncFullHistory: true, // Optional: Get full chat history (use with caution!)
  });

  sockClient.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    qrCode = update.qr; // Get QR code from the update object directly

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "Connection closed due to",
        lastDisconnect.error,
        ", reconnecting:",
        shouldReconnect
      );
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("Opened connection");
    }
  });

  sockClient.ev.on("creds.update", saveCreds);
};

connectToWhatsApp();

// Express and Socket.io setup

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://goyalinfocom.com", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

// HTTP Routes

app.get("/", (req, res) => {
  res.send("Server Running!");
});

app.get("/login", async (req, res) => {
  try {
    if (sockClient && sockClient.user) {
      res.send("<h2>Already logged in!</h2>");
      return;
    }
    if (!qrCode) {
      res.send("<h2>Waiting for QR code... Please refresh.</h2>"); // Inform user to refresh
      return;
    }

    qrcode.toDataURL(qrCode, (err, url) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .send("<h1>Internal Server Error</h1><p>Please try again later.</p>");
      }
      res.send(`<img src="${url}" alt="QR Code" />`);
    });
  } catch (error) {
    console.error("Error in /login:", error);
    res
      .status(500)
      .send("<h1>Internal Server Error</h1><p>Please try again later.</p>");
  }
});

app.post("/sendWa", async (req, res) => {
  if (!sockClient || !sockClient.user) {
    return res.status(401).json({ msg: "Not logged in" });
  }

  const { phone, msg, mediaUrl, fileName, fileExt } = req.body;

  const number = getJid(phone);

  try {
    if (mediaUrl) {
      const supportedFileTypes = {
        image: ["gif", "jpg", "jpeg", "png", "heic", "heif"],
        video: ["mp4", "3gp", "mkv", "avi", "mov"], // Add mov
        document: ["pdf", "docx", "xlsx"],
        audio: ["mp3", "ogg", "m4a"], // Common audio types
        sticker: ["webp"],
      };

      let mimetype = null;
      let messageType = null;

      if (supportedFileTypes.image.includes(fileExt.toLowerCase())) {
        mimetype = Mimetype.jpeg; // or Mimetype.png, etc. depending on fileExt
        messageType = "image";
      } else if (supportedFileTypes.video.includes(fileExt.toLowerCase())) {
        mimetype = Mimetype.mp4; // or other video mimetype
        messageType = "video";
      } else if (supportedFileTypes.document.includes(fileExt.toLowerCase())) {
        mimetype = Mimetype[fileExt.toLowerCase()]; // Use dynamic Mimetype if available
        if (!mimetype) {
          mimetype = `application/${fileExt.toLowerCase()}`; // Generic document mimetype if needed.
        }
        messageType = "document";
      } else if (supportedFileTypes.audio.includes(fileExt.toLowerCase())) {
        mimetype = Mimetype[fileExt.toLowerCase()]; // Use dynamic Mimetype if available, otherwise generic:
        if (!mimetype) {
          mimetype = `audio/${fileExt.toLowerCase()}`;
        }

        messageType = "audio";
      } else if (supportedFileTypes.sticker.includes(fileExt.toLowerCase())) {
        mimetype = Mimetype.webp;
        messageType = "sticker";
      } else {
        return res.status(400).json({ msg: "Unsupported file type" });
      }

      const response = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
      });
      const mediaData = Buffer.from(response.data, "binary");

      const message = {
        [messageType]: mediaData,
        mimetype: mimetype, // Set mimetype explicitly
        fileName: fileName || "file", // Provide a default filename if not given
        caption: msg || undefined, // Caption if provided
        // ptt: messageType === 'audio' // Use ptt for audio notes (voice messages)
      };
      await sockClient.sendMessage(number, message);
    } else if (msg) {
      await sockClient.sendMessage(number, { text: msg });
    } else {
      return res.status(400).json({ error: "No message or media provided" });
    }

    res.json({ msg: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ msg: "Error sending message" }); // More informative error message
  }
});

// Socket.io Events

io.on("connection", (socket) => {
  console.log("A user connected via Socket.IO");

  socket.emit("replyFromSocket", {
    message: "WhatsApp Server Connected Successfully",
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO user disconnected");
  });

  socket.on("sendMessages", async (users) => {
    if (!sockClient || !sockClient.user) {
      socket.emit("replyFromSocket", { message: "Not logged in" });
      return;
    }

    try {
      for (const user of users) {
        const phone = getJid(user.phone);
        const username = user.name;
        for (const message of user.messages) {
          let messageContent = {};
          if (message.type === "text") {
            messageContent = { text: message.body }; // Text message
          } else {
            const supportedFileTypes = {
              image: ["jpg", "jpeg", "png", "gif"],
              video: ["mp4", "mov", "avi"],
              document: ["pdf", "docx"],
              audio: ["mp3", "ogg", "m4a"],
              sticker: ["webp"],
            };

            const ext = path.extname(message.url).slice(1).toLowerCase(); // Extract extension

            let mimeType = null;
            if (supportedFileTypes.image.includes(ext)) {
              mimeType = Mimetype.jpeg;
            } else if (supportedFileTypes.video.includes(ext)) {
              mimeType = Mimetype.mp4;
            } else if (supportedFileTypes.document.includes(ext)) {
              mimeType = Mimetype[ext] || `application/${ext}`;
            } else if (supportedFileTypes.audio.includes(ext)) {
              mimeType = Mimetype[ext] || `audio/${ext}`;
            } else if (supportedFileTypes.sticker.includes(ext)) {
              mimeType = Mimetype.webp;
            } else {
              console.error(`Unsupported file type: ${ext}`);
              continue; // Skip to next message
            }

            try {
              const response = await axios.get(`https:${message.url}`, {
                responseType: "arraybuffer",
              });

              const buffer = Buffer.from(response.data, "binary");

              messageContent = {
                [message.type]: buffer,
                mimetype: mimeType, // Set mimetype here
                fileName: message.name,
                caption: message.caption, // Add caption if it exists
              };
            } catch (fileDownloadError) {
              console.error("Error downloading file:", fileDownloadError);
              socket.emit("replyFromSocket", {
                message: `Error sending to ${username}: ${fileDownloadError.message}`,
              });

              continue; // Skip to next message if download fails
            }
          }

          try {
            await sockClient.sendMessage(phone, messageContent);
          } catch (sendError) {
            console.error("Error sending message:", sendError);
            socket.emit("replyFromSocket", {
              message: `Error sending to ${username}: ${sendError.message}`,
            });

            continue; // Skip to next recipient if sending fails
          }

          await new Promise((resolve) => setTimeout(resolve, 2500)); // Delay between messages
        }

        socket.emit("replyFromSocket", {
          message: `Messages sent to ${username}`,
        });
      }
    } catch (error) {
      console.error("Error in sendMessages:", error);
      socket.emit("replyFromSocket", { message: `Error: ${error.message}` });
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
