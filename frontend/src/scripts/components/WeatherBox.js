// WeatherBox.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WeatherBox.css";
import {
    WiDaySunny,
    WiNightClear,
    WiDayCloudy,
    WiNightAltCloudy,
    WiCloudy,
    WiShowers,
    WiRain,
    WiStormShowers,
    WiSnow,
    WiFog
} from "react-icons/wi";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

const cityCoordinates = {
    "서울": { lat: 37.5665, lon: 126.9780 },
    "부산": { lat: 35.1796, lon: 129.0756 },
    "대구": { lat: 35.8714, lon: 128.6014 },
    "광주": { lat: 35.1595, lon: 126.8526 },
    "대전": { lat: 36.3504, lon: 127.3845 },
    "인천": { lat: 37.4563, lon: 126.7052 },
    "경주": { lat: 35.8562, lon: 129.2247 }, 
    "강릉": { lat: 37.7519, lon: 128.8761 }, 
    "여수": { lat: 34.7604, lon: 127.6622 }, 
    "평창": { lat: 37.3705, lon: 128.3900 }, 
    "거제": { lat: 34.8806, lon: 128.6211 }, 
    "제주": { lat: 33.4996, lon: 126.5312 }
};

// OpenWeather API icon => react-icons component mapping
const iconMapping = {
    "01d": WiDaySunny,
    "01n": WiNightClear,
    "02d": WiDayCloudy,
    "02n": WiNightAltCloudy,
    "03d": WiCloudy,
    "03n": WiCloudy,
    "04d": WiCloudy,
    "04n": WiCloudy,
    "09d": WiShowers,
    "09n": WiShowers,
    "10d": WiRain,
    "10n": WiRain,
    "11d": WiStormShowers,
    "11n": WiStormShowers,
    "13d": WiSnow,
    "13n": WiSnow,
    "50d": WiFog,
    "50n": WiFog
};

const WeatherBox = ({ city }) => {
    const [weatherData, setWeatherData] = useState([]);


    useEffect(() => {
        if (!city) return;
        const coords = cityCoordinates[city];
        if (!coords) return;


        const { lat, lon } = coords;
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;

        axios
            .get(url)
            .then((res) => {
                setWeatherData(res.data.daily.slice(0, 7));
            })
            .catch(console.error);
    }, [city]);

    return (
        <div className="weather-box">
            <div className="weather-city">{city}시</div>
            <div className="weather-days">
                {weatherData.map((day, idx) => {
                    const code = day.weather[0].icon;
                    const Icon = iconMapping[code] || WiDaySunny;
                    return (
                        <div className="weather-day" key={idx}>
                            <div className="day-name">
                                {new Date(day.dt * 1000).toLocaleDateString("ko-KR", { weekday: 'short' })}
                            </div>
                            <Icon className="weather-icon" size={55} />
                            <div className="temp-range">
                                {Math.round(day.temp.max)}°/ {Math.round(day.temp.min)}°
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default WeatherBox;
