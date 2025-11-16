import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserFavorites, addFavorite, deleteFavorite } from '$lib/server/weather';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}
	const favorites = await getUserFavorites(locals.user.id);
	return json(favorites);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}
	const data = await request.json();
	const { cityName, country, lat, lon, nickname } = data;
	if (!cityName || !country || !lat || !lon) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const favorite = await addFavorite(locals.user.id, cityName, country, lat, lon, nickname);
	if (!favorite) {
		return json({ error: 'Failed to add favorite' }, { status: 500 });
	}
	return json(favorite);
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}
	const success = await deleteFavorite(locals.user.id, parseInt(id));
	if (!success) {
		return json({ error: 'Failed to delete favorite' }, { status: 500 });
	}
	return json({ success: true });
};
