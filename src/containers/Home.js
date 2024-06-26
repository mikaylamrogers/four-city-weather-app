import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import moment from 'moment-timezone';

import WeatherImage from "../components/WeatherImage";

const weatherKey = `a9f1bf42965f0a8fe32093676aa04e78`;

function Home() {
    const location = useLocation();

    const [weatherData, setWeatherData] = useState(null);
    const [city, setCity] = useState("Manila");
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        const searchParams = location.search;
        const urlParams = new URLSearchParams(searchParams);
        const cityFromUrl = urlParams.get("city");
        if (cityFromUrl && cityFromUrl !== city) {
            setCity(cityFromUrl);
        }
    }, [location.search, city]);
    

    useEffect(() => {
        console.log(`Fetching weather data for city: ${city}`);
        axios
            .get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${weatherKey}`
            )
            .then(function (response) {
                console.log("API response received: ", response);
                const weather = response.data;
                setWeatherData(weather);
    
                const timezone = weather.timezone;
                const updateDateTime = () => {
                    const cityDateTime = moment().utcOffset(timezone / 60);
                    setDate(cityDateTime.format('MMMM D, YYYY'));
                    setTime(cityDateTime.format('h:mm A'));
                };
    
                updateDateTime();
                const intervalId = setInterval(updateDateTime, 60000); 
    
                return () => clearInterval(intervalId);
            })
            .catch(function (error) {
                console.error("Error fetching weather data: ", error);
            });
    }, [city]);
    
    

    const {
        cloudiness,
        currentTemp,
        highTemp,
        humidity,
        lowTemp,
        weatherType,
        windSpeed,
    } = useMemo(() => {
        let cloudiness = '';
        let currentTemp = '';
        let highTemp = '';
        let humidity = '';
        let lowTemp = '';
        let weatherType = '';
        let windSpeed = '';

        if (weatherData) {
            cloudiness = weatherData.clouds.all + '%';
            currentTemp = Math.round(weatherData.main.temp) + '°';
            highTemp = Math.round(weatherData.main.temp_max) + '°';
            humidity = weatherData.main.humidity + '%';
            lowTemp = Math.round(weatherData.main.temp_min) + '°';
            weatherType = weatherData.weather[0].description;
            windSpeed = weatherData.wind.speed + ' m/h';
        }

        return {
            cloudiness,
            currentTemp,
            highTemp,
            humidity,
            lowTemp,
            weatherType,
            windSpeed,
        };
    }, [weatherData]);

    console.log("weatherData", weatherData);

    const temperature = parseInt(currentTemp.slice(0, -1));

    let gradientColor;
    
    if (temperature < 20) {
        gradientColor = `radial-gradient(rgba(89, 212, 228, ${parseInt(cloudiness.slice(0, -1)) / 250 }), rgba(89, 212, 228, ${parseInt(cloudiness.slice(0, -1)) / 150 + 0.5 }))`;
    } else if (temperature >= 20 && temperature <= 23) {
        gradientColor = `radial-gradient(rgba(146, 220, 154, ${parseInt(cloudiness.slice(0, -1)) / 250 }), rgba(146, 220, 154, ${parseInt(cloudiness.slice(0, -1)) / 150 + 0.5 }))`;
    } else {
        gradientColor = `radial-gradient(rgba(240, 168, 101, ${parseInt(cloudiness.slice(0, -1)) / 250 }), rgba(240, 168, 101, ${parseInt(cloudiness.slice(0, -1)) / 150 + 0.5 }))`;
    }
    
    const backgroundStyle = {
        background: gradientColor,
        transition: "background 1s ease"
      };
      
    return (
        <div className="contentWrapper">
            <div className="topTitle">
                <div className="date">{date}</div>
                <h2 className="city"> {city} </h2>
                <div className="time">{time}</div>
            </div>

            <main className="Home">
                <div className="Head" style={ backgroundStyle }>
                    <div className="WeatherInfo_Display">
                        <div className="Icon"><WeatherImage weatherType={weatherType} /></div>
                        <h3 className="weatherInfo_Current">{currentTemp}</h3>
                        <p className="weatherInfo_Type">{weatherType}</p>
                    </div>

                    <div className="WeatherInfo">
                        <div className="WeatherInfoSection">
                            <p className="WeatherDetails">high temperature </p>
                            <p className="Numbers">{highTemp}</p>
                        </div>

                        <div className="WeatherInfoSection">
                            <p className="WeatherDetails">low temperature </p>
                            <p className="Numbers">{lowTemp}</p>
                        </div>

                        <div className="WeatherInfoSection">
                            <p className="WeatherDetails">cloudiness </p>
                            <p className="Numbers">{cloudiness}</p>
                        </div>

                        <div className="WeatherInfoSection">
                            <p className="WeatherDetails">humidity </p>
                            <p className="Numbers">{humidity}</p>
                        </div>

                        <div className="WeatherInfoSection">
                            <p className="WeatherDetails">wind speed </p>
                            <p className="Numbers">{windSpeed}</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="navBar">
                <nav>
                    <Link to="/?city=Manila">Manila</Link>
                    <Link to="/?city=Amsterdam">Amsterdam</Link>
                    <Link to="/?city=Honolulu">Honolulu</Link>
                    <Link to="/?city=Sydney">Sydney</Link>
                </nav>
            </footer>
        </div>
    );
}

export default Home;
