import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getWeatherByCity,
	getUserFavorites,
	addFavorite,
	deleteFavorite
} from '$lib/server/weather.js';

const userId = 'demo-user';

export const load: PageServerLoad = async ({ url }: { url: URL }) => {
	// Load favorites on every page load
	const favorites = await getUserFavorites(userId);

	// Check if there's a city query parameter (from search or favorite click)
	const cityParam = url.searchParams.get('city');
	let weather = null;
	let error = '';

	if (cityParam) {
		try {
			weather = await getWeatherByCity(cityParam);
			if (!weather) {
				error = 'City not found';
			}
		} catch (e) {
			error = 'Failed to fetch weather data';
		}
	}

	return {
		favorites,
		weather,
		error,
		searchedCity: cityParam || ''
	};
};

export const actions: Actions = {
	search: async ({ request }) => {
		const data = await request.formData();
		const city = data.get('city') as string;

		if (!city?.trim()) {
			return fail(400, { error: 'City name is required' });
		}

		try {
			const weather = await getWeatherByCity(city);

			if (!weather) {
				return fail(404, { error: 'City not found', city });
			}

			return { success: true, weather, city };
		} catch (e) {
			return fail(500, { error: 'Failed to fetch weather data', city });
		}
	},

	saveFavorite: async ({ request }) => {
		const data = await request.formData();
		const cityName = data.get('cityName') as string;
		const country = data.get('country') as string;
		const lat = data.get('lat') as string;
		const lon = data.get('lon') as string;
		const nickname = data.get('nickname') as string | null;

		if (!cityName || !country || !lat || !lon) {
			return fail(400, { error: 'Missing required fields' });
		}

		try {
			const favorite = await addFavorite(userId, cityName, country, lat, lon, nickname);

			if (!favorite) {
				return fail(500, { error: 'Failed to save favorite' });
			}

			return { success: true, message: 'Favorite saved successfully' };
		} catch (e) {
			return fail(500, { error: 'Failed to save favorite' });
		}
	},

	deleteFavorite: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Missing favorite ID' });
		}

		try {
			const success = await deleteFavorite(userId, parseInt(id));

			if (!success) {
				return fail(500, { error: 'Failed to delete favorite' });
			}

			return { success: true, message: 'Favorite deleted successfully' };
		} catch (e) {
			return fail(500, { error: 'Failed to delete favorite' });
		}
	}
};
