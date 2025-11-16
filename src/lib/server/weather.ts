import { db } from './db/index.ts';
import { sql } from 'drizzle-orm';

export interface WeatherData {
	city: string;
	country: string;
	lat: number;
	lon: number;
	temp: number;
	description: string;
	weatherCode: number;
	humidity: number;
	windSpeed: number;
}

export interface FavoriteLocation {
	id: number;
	userId: string;
	cityName: string;
	country: string;
	lat: string;
	lon: string;
	nickname: string | null;
	createdAt: Date;
}

interface GeocodingResult {
	name: string;
	country: string;
	latitude: number;
	longitude: number;
}

// Step 1: Convert city name to coordinates using Open-Meteo Geocoding API
export async function geocodeCity(city: string): Promise<GeocodingResult | null> {
	const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

	const response = await fetch(url);
	if (!response.ok) return null;

	const data = await response.json();

	if (!data.results || data.results.length === 0) return null;

	const result = data.results[0];
	return {
		name: result.name,
		country: result.country,
		latitude: result.latitude,
		longitude: result.longitude
	};
}

// Step 2: Get weather data using coordinates
export async function getWeatherByCoordinates(
	lat: number,
	lon: number
): Promise<Omit<WeatherData, 'city' | 'country'> | null> {
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

	const response = await fetch(url);
	if (!response.ok) return null;

	const data = await response.json();

	return {
		lat,
		lon,
		temp: Math.round(data.current.temperature_2m),
		description: getWeatherDescription(data.current.weather_code),
		weatherCode: data.current.weather_code,
		humidity: data.current.relative_humidity_2m,
		windSpeed: data.current.wind_speed_10m
	};
}

// Combined function: Get weather by city name
export async function getWeatherByCity(city: string): Promise<WeatherData | null> {
	// First, get coordinates
	const location = await geocodeCity(city);
	if (!location) return null;

	// Then, get weather
	const weather = await getWeatherByCoordinates(location.latitude, location.longitude);
	if (!weather) return null;

	return {
		...weather,
		city: location.name,
		country: location.country
	};
}

// Convert WMO weather code to description
function getWeatherDescription(code: number): string {
	const descriptions: Record<number, string> = {
		0: 'Clear sky',
		1: 'Mainly clear',
		2: 'Partly cloudy',
		3: 'Overcast',
		45: 'Foggy',
		48: 'Depositing rime fog',
		51: 'Light drizzle',
		53: 'Moderate drizzle',
		55: 'Dense drizzle',
		61: 'Slight rain',
		63: 'Moderate rain',
		65: 'Heavy rain',
		71: 'Slight snow',
		73: 'Moderate snow',
		75: 'Heavy snow',
		77: 'Snow grains',
		80: 'Slight rain showers',
		81: 'Moderate rain showers',
		82: 'Violent rain showers',
		85: 'Slight snow showers',
		86: 'Heavy snow showers',
		95: 'Thunderstorm',
		96: 'Thunderstorm with slight hail',
		99: 'Thunderstorm with heavy hail'
	};

	return descriptions[code] || 'Unknown';
}

// RAW SQL: Get all favorites for a user
export async function getUserFavorites(userId: string): Promise<FavoriteLocation[]> {
	// This is raw SQL! We're writing PostgreSQL directly
	const result = await db.execute(sql`
          SELECT id, user_id, city_name, country, lat, lon, nickname, created_at
          FROM favorite_location
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
      `);

	return result as unknown as FavoriteLocation[];
}

// RAW SQL: Add a favorite location
export async function addFavorite(
	userId: string,
	cityName: string,
	country: string,
	lat: string,
	lon: string,
	nickname?: string
): Promise<FavoriteLocation | unknown> {
	try {
		// INSERT statement with RETURNING clause
		const result = await db.execute(sql`
          INSERT INTO favorite_location (user_id, city_name, country, lat, lon, nickname)
          VALUES (${userId}, ${cityName}, ${country}, ${lat}, ${lon}, ${nickname || null})
          RETURNING id, user_id, city_name, country, lat, lon, nickname, created_at
      `);
		return result as unknown as FavoriteLocation[];
	} catch (error) {
		// This will catch the unique constraint violation
		console.error('Failed to add favorite:', error);
		return null;
	}
}

// RAW SQL: Delete a favorite
export async function deleteFavorite(userId: string, id: number): Promise<boolean> {
	try {
		// Use RETURNING to check if anything was deleted
		const result = await db.execute<{ id: number }>(sql`
              DELETE FROM favorite_location
              WHERE id = ${id} AND user_id = ${userId}
              RETURNING id
          `);

		// If a row was returned, deletion was successful
		return Array.isArray(result) && result.length > 0;
	} catch (error) {
		console.error('Failed to delete favorite:', error);
		return false;
	}
}
