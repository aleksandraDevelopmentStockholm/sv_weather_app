import { json, type RequestHandler } from '@sveltejs/kit';
import { getWeatherByCity } from '$lib/server/weather.ts';
export const GET: RequestHandler = async ({ url }) => {
	const city = url.searchParams.get('city');

	if (!city) {
		return json({ error: 'City parameter is required' }, { status: 400 });
	}

	const weather = await getWeatherByCity(city);

	if (!weather) {
		return json({ error: 'City not found' }, { status: 404 });
	}

	return json(weather);
};
