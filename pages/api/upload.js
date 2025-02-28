import multer from "multer";
import nextConnect from "next-connect";
import os from "os";
import path from "path";
import fs from "fs";
import csvParser from "csv-parser";
import Redis from "ioredis";

// Connect to Redis
const redis = new Redis(process.env.REDIS_URL, {
  tls: { rejectUnauthorized: false }, // Required for Upstash
});


const upload = multer({ dest: path.join(os.tmpdir(), "uploads") });

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error("❌ API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post((req, res) => {
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log("✅ Parsed CSV Data:", results); // Logs parsed CSV to console

      try {
        // Store parsed data in Redis
        await redis.set("parsed_csv_data", JSON.stringify(results));
        console.log("✅ Data stored in Redis!");

        // Send the parsed data to the frontend
        res.status(200).json({
          message: "✅ File uploaded and parsed successfully!",
          data: results,  // <-- Sending parsed data
        });
      } catch (error) {
        console.error("❌ Redis Error:", error);
        res.status(500).json({ error: "Failed to store data in Redis" });
      } finally {
        fs.unlinkSync(filePath); // Delete the temporary file
      }
    });
});

export default apiRoute;
export const config = { api: { bodyParser: false } };
