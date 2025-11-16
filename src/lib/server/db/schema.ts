import { pgTable, serial, integer, text, timestamp, unique } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const favoriteLocation = pgTable(
	'favorite_location',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		cityName: text('city_name').notNull(),
		country: text('country').notNull(),
		lat: text('lat').notNull(),
		lon: text('lon').notNull(),
		nickname: text('nickname'), // NEW: Optional custom name
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		// Ensures user can't save the same city twice
		uniqueUserLocation: unique().on(table.userId, table.cityName, table.country)
	})
);

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type FavoriteLocation = typeof favoriteLocation.$inferSelect;
