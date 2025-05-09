const express = require("express");
const fetch = require("node-fetch");
const FormData = require("form-data");

const IMGUR_CLIENT_ID = "b4eea18dab2344f";

const app = express();
app.use(express.json());

app.post("/upload", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).send("Missing imageUrl");

  try {
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return res.status(400).send("URL does not point to an image");
    }

    const buffer = await response.buffer();
    const form = new FormData();
    form.append("image", buffer.toString("base64")); // Imgur 要求 base64 格式上传

    const imgurRes = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: form
    });

    const result = await imgurRes.json();

    if (!result.success) {
      return res.status(500).json({ error: "Imgur upload failed", details: result });
    }

    res.json({
      success: true,
      imgurUrl: result.data.link
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Imgur upload service is running.");
});

app.listen(3000, () => console.log("Server running on port 3000"));
