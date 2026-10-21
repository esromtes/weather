const express = require("express");
const app = express();
const https = require("https");
const bodyParser = require("body-parser");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the template engine
app.set("view engine", "ejs");

// 1. GET Route: Serve the HTML form
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// 2. POST Route: Receive city, fetch weather, and render EJS page
app.post("/", function (req, res) {
  const query = req.body.input;
  const apiKey = "c40fd818668239b98328b5ebc06aad8a";
  const unit = "metric";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${unit}`;

  https.get(url, function (response) {
    let rawData = "";

    response.on("data", function (chunk) {
      rawData += chunk;
    });

    response.on("end", function () {
      const weatherData = JSON.parse(rawData);

      // Handle invalid city names
      if (response.statusCode !== 200) {
        return res.send(`<h1>Error: ${weatherData.message}</h1>`);
      }

      // Render the EJS file passing the variables directly
      res.render("weather", {
        city: query,
        temp: weatherData.main.temp, // Fixed path from weatherData.temp
        description: weatherData.weather[0].description,
        iconUrl: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
      });
    });
  });
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
