import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ File uploaded successfully!");
      } else {
        setMessage("❌ Upload failed: " + result.error);
      }
    } catch (error) {
      setMessage("❌ Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h1>CSV Upload System</h1>
      <div className="upload-box">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload CSV"}
        </button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
