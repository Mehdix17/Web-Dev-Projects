import express from "express";
import axios from "axios";

const router = express.Router();

// Icon mapping
const iconMap = {
  "01d": "fas fa-sun",
  "01n": "fas fa-moon",
  "02d": "fas fa-cloud-sun",
  "02n": "fas fa-cloud-moon",
  "03d": "fas fa-cloud",
  "03n": "fas fa-cloud",
  "04d": "fas fa-cloud-meatball",
  "04n": "fas fa-cloud-meatball",
  "09d": "fas fa-cloud-rain",
  "09n": "fas fa-cloud-rain",
  "10d": "fas fa-cloud-showers-heavy",
  "10n": "fas fa-cloud-showers-heavy",
  "11d": "fas fa-bolt",
  "11n": "fas fa-bolt",
  "13d": "fas fa-snowflake",
  "13n": "fas fa-snowflake",
  "50d": "fas fa-smog",
  "50n": "fas fa-smog",
};

// GET /weather?city=CityName
router.get("/", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.render("index", {
      weatherData: null,
      error: "Please enter a city name",
    });
  }

  const apiKey = process.env.API_KEY;
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    const weatherData = {
      city: data.name,
      temp: data.main.temp,
      description: data.weather[0].description,
      iconClass: iconMap[data.weather[0].icon] || "fas fa-question-circle", // Default icon
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };

    res.render("index", { weatherData, error: null });
  } catch (error) {
    res.render("index", {
      weatherData: null,
      error: "City not found",
    });
  }
});

export default router;
