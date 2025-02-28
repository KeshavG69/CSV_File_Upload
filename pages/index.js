import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [csvData, setCsvData] = useState([]);

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
        setCsvData(result.data);
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
    <div style={{ backgroundColor: "#ffffff", color: "#000", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <div style={{ width: "800px", backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" }}>
        <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>CSV Upload System</h1>
        
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              backgroundColor: uploading ? "#ccc" : "#007bff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              borderRadius: "5px",
              transition: "background 0.3s",
            }}
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>

        {message && <p style={{ textAlign: "center", fontWeight: "bold" }}>{message}</p>}

        {/* Display parsed CSV data in a table */}
        {csvData.length > 0 && (
          <div>
            <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Parsed CSV Data</h2>
            <div style={{ overflowX: "auto", maxHeight: "400px", border: "1px solid #ddd", borderRadius: "5px" }}>
              <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#007bff", color: "#fff" }}>
                    {Object.keys(csvData[0]).map((key) => (
                      <th key={key} style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2" }}>
                      {Object.values(row).map((value, i) => (
                        <td key={i} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
