import multer from "multer";
import nextConnect from "next-connect";
import os from "os";
import path from "path";
import fs from "fs";
import csvParser from "csv-parser";

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
    .on("end", () => {
      console.log("✅ Parsed CSV Data:", results); // Logs parsed CSV to console
      res.status(200).json({
        message: "✅ File uploaded and parsed successfully!",
        data: results,
      });

      // Optional: Delete file after processing
      fs.unlinkSync(filePath);
    });
});

export default apiRoute;
export const config = { api: { bodyParser: false } };
