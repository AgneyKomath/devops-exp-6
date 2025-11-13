const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

app.get("/orders", (req, res) => {
  res.json([
    { id: 101, item: "Laptop", amount: 75000 },
    { id: 102, item: "Mobile", amount: 25000 },
    { id: 103, item: "Headphones", amount: 3000 },
  ]);
});

app.get("/health", (req, res) => res.send("OK"));

app.listen(port, () => {
  console.log(`Order service running on port ${port}`);
});
