require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.static("."));

app.get("/api/*path", async (req, res) => {
    try {
        const endpoint = req.params.path.join("/");
        const queryString = new URLSearchParams(req.query).toString();
        const url = `${process.env.BASE_URL}/${endpoint}${queryString ? "?" + queryString : ""}`;

        const response = await fetch(url, {
            headers: { "Authorization": `Bot ${process.env.API_KEY}` }
        });
        const data = await response.json();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));