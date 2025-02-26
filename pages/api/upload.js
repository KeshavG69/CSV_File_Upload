import nextConnect from "next-connect";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error("❌ API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  },
})
  .use(upload.single("file"))
  .post((req, res) => {
    if (!req.file) {
      console.error("❌ No file received");
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    const validUsers = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.name && row.email) {
          validUsers.push({ name: row.name, email: row.email });
        }
      })
      .on("end", () => {
        console.log("✅ Parsed CSV:", validUsers);

        // Cleanup: Remove file after processing
        fs.unlinkSync(filePath);

        res.status(200).json({ validUsers });
      })
      .on("error", (error) => {
        console.error("❌ CSV Parsing Error:", error);
        res.status(500).json({ error: "Error processing CSV file." });
      });
  });

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
};
