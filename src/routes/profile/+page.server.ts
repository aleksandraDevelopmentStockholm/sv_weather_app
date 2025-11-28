import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';

// Load function - runs before page renders
export const load: PageServerLoad = async (event) => {
	// Protect this route - redirect if not logged in
	if (!event.locals.user) {
		return redirect(302, '/auth/login');
	}

	// Return user data to the page
	return {
		user: event.locals.user
	};
};

// Form actions - handle form submissions
export const actions: Actions = {
	updateUsername: async (event) => {
		// Check if logged in
		if (!event.locals.user) {
			return fail(401, { message: 'Not authenticated' });
		}

		const formData = await event.request.formData();
		const newUsername = formData.get('username');

		// Validate
		if (typeof newUsername !== 'string' || newUsername.length < 3 || newUsername.length > 31) {
			return fail(400, {
				message: 'Username must be 3-31 characters',
				username: newUsername?.toString() ?? ''
			});
		}

		if (!/^[a-z0-9_-]+$/.test(newUsername)) {
			return fail(400, {
				message: 'Username can only contain lowercase letters, numbers, _ and -',
				username: newUsername
			});
		}

		try {
			// Update in database
			await db
				.update(table.user)
				.set({ username: newUsername })
				.where(eq(table.user.id, event.locals.user.id));

			return { success: true, message: 'Username updated!' };
		} catch (e) {
			return fail(400, { message: 'Username already taken', username: newUsername });
		}
	}
};
