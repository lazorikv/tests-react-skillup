import React, { useState, useEffect } from 'react';
import { getWeatherByCity, WeatherData } from '../services/weatherService';
import './Weather.css';

export const Weather = () => {
  const [city, setCity] = useState('Kyiv');
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSubmit();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!city) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getWeatherByCity(city);
      setWeather(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-container">
      <form onSubmit={handleSubmit} className="weather-form">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="weather-input"
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="weather-button"
          aria-label="Get weather"
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>Weather in {weather.name}</h2>
          <div className="weather-details">
            <p>Temperature: {weather.main.temp}°C</p>
            <p>Feels like: {weather.main.feels_like}°C</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Description: {weather.weather[0].description}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 