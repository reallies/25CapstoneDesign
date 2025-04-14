// WeatherBox.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WeatherBox.css";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

const cityCoordinates = {
    "서울": { lat: 37.5665, lon: 126.9780 },
    "부산": { lat: 35.1796, lon: 129.0756 },
    "대구": { lat: 35.8714, lon: 128.6014 },
    "인천": { lat: 37.4563, lon: 126.7052 },
    "대전": { lat: 36.3504, lon: 127.3845 },
    "광주": { lat: 35.1595, lon: 126.8526 },
    "울산": { lat: 35.5384, lon: 129.3114 },
    "세종": { lat: 36.4800, lon: 127.2890 },
    "경기": { lat: 37.4138, lon: 127.5183 },
    "강원": { lat: 37.8228, lon: 128.1555 },
    "충북": { lat: 36.6424, lon: 127.4890 },
    "충남": { lat: 36.5184, lon: 126.8000 },
    "전북": { lat: 35.8200, lon: 127.1480 },
    "전남": { lat: 34.8114, lon: 126.3926 },
    "경북": { lat: 36.4919, lon: 128.8889 },
    "경남": { lat: 35.1911, lon: 128.1064 },
    "제주": { lat: 33.4996, lon: 126.5312 }
};

const WeatherBox = ({ city, destinations }) => {
    const [selectedCity, setSelectedCity] = useState(city);
    const [weatherData, setWeatherData] = useState([]);

    useEffect(() => {
        const { lat, lon } = cityCoordinates[selectedCity];
        if (!lat || !lon) return;

        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;

        axios.get(url)
            .then((res) => {
                setWeatherData(res.data.daily.slice(0, 7));
            })
            .catch(console.error);
    }, [selectedCity]);

    const formatDay = (unix) => {
        return new Date(unix * 1000).toLocaleDateString("ko-KR", { weekday: "short" });
    };

    return (
        <div className="weather-box">
            <div className="weather-days">
                {weatherData.map((day, idx) => (
                    <div className="weather-day" key={idx}>
                        <div className="day-name">{formatDay(day.dt)}</div>
                        <img
                            style={{ height: '70px' }}
                            src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                            alt={day.weather[0].description}
                        />
                        <div className="temp-range">{Math.round(day.temp.min)}° / {Math.round(day.temp.max)}°</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherBox;
