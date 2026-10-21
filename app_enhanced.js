const express = require("express");
const axios = require("axios");
require("dotenv").config();
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WEATHER_API_KEY;


// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the template engine
app.set("view engine", "ejs");

// 1. GET Route: Serve the search page
app.get("/", async (req, res) => {
  try {
    res.render("index");
  } catch (error) {
    console.error("Error rendering index page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 2. POST Route: Receive city, fetch weather, and render result page
app.post("/", async (req, res) => {
  const city = req.body.input;

  if (!city) {
    return res.render("index", { error: "Please enter a city name." });
  }

  try {
    const unit = "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}`;

    const response = await axios.get(url);
    const weatherData = response.data;

    res.render("weather_enhanced", {
      city: weatherData.name,
      temp: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      description: weatherData.weather[0].description,
      iconUrl: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
      windSpeed: weatherData.wind.speed,
    });
  } catch (error) {
    if (error.response) {
      // API returned a non-2xx status code
      const message = error.response.data.message || "City not found";
      res.render("index", { error: message });
    } else {
      // Network or other error
      console.error("Unexpected error:", error.message);
      res.render("index", { error: "An unexpected error occurred. Please try again." });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
