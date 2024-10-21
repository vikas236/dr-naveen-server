require("dotenv").config(); // Load environment variables

const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");

const app = express();
const port = 3000;

const cors = require("cors");
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// PostgreSQL client configuration from environment variables
const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

app.get("/", async (req, res) => {
  res.status(200).json("Hello");
});

app.get("/gallery", async (req, res) => {
  try {
    // Query to select all data from the table
    const query = "SELECT * FROM drnaveengallery;";
    const result = await client.query(query);

    // Send the result rows as JSON
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/removeimg", async (req, res) => {
  const { data } = req.body;
  const imageData = data;

  try {
    // Query to select all data from the table
    const query = "DELETE FROM drnaveengallery WHERE image_data = $1;";
    const result = await client.query(query, [data]);

    // Send the result rows as JSON
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/send-string", async (req, res) => {
  const { data } = req.body;
  const imageData = data;

  if (!imageData) {
    return res.status(400).json({ error: "No image data provided" });
  }

  const query = `INSERT INTO drnaveengallery (image_data) VALUES ($1)`;

  try {
    // Insert image data as a bytea (binary) type
    await client.query(query, [imageData]);
    res
      .status(200)
      .json({ message: "image uploaded successfully", received: imageData });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "No image data provided" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
