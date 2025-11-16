// Weather data from the API
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

// Favorite location from the database
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

// API error response
export interface ApiError {
	error: string;
}
