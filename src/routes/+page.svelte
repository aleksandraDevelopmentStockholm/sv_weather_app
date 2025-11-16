<script lang="ts">
	import { onMount } from 'svelte';
	import type { WeatherData, FavoriteLocation } from '$lib/types.js';
	import { SearchSolid, StarSolid, TrashBinSolid, BadgeCheckSolid } from 'flowbite-svelte-icons';
	import { m } from '$lib/paraglide/messages';

	let { data } = $props();
	let city = $state('');
	let weather: WeatherData | null = $state(null);
	let loading = $state(false);
	let error = $state('');
	let favorites: FavoriteLocation[] = $state([]);
	let savingFavorite = $state(false);
	// Load favorites when component mounts
	onMount(async () => {
		await loadFavorites();
	});

	async function loadFavorites() {
		try {
			if(data.user) {
				const response = await fetch('/api/favorites');
				favorites = await response.json();
			}
		} catch (e) {
			console.error('Failed to load favorites:', e);
		}
	}

	async function searchWeather() {
		if (!city.trim()) return;

		loading = true;
		error = '';
		weather = null;

		try {
			const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
			const data = await response.json();

			if (response.ok) {
				weather = data as WeatherData;
			} else {
				error = data.error || 'Failed to fetch weather';
			}
		} catch (e) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function saveFavorite() {
		if (!weather) return;

		savingFavorite = true;

		try {
			const response = await fetch('/api/favorites', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					cityName: weather.city,
					country: weather.country,
					lat: weather.lat,
					lon: weather.lon
				})
			});

			if (response.ok) {
				await loadFavorites();
			} else {
				const data = await response.json();
				error = data.error || 'Failed to save favorite';
			}
		} catch (e) {
			error = 'Failed to save favorite';
		} finally {
			savingFavorite = false;
		}
	}

	async function deleteFavorite(id: number) {
		try {
			const response = await fetch(`/api/favorites?id=${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadFavorites();
			} else {
				error = 'Failed to delete favorite';
			}
		} catch (e) {
			error = 'Failed to delete favorite';
		}
	}

	async function loadWeatherFromFavorite(lat: number, lon: number, cityName: string) {
		city = cityName;
		loading = true;
		error = '';

		try {
			const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
			const data = await response.json();

			if (response.ok) {
				weather = data as WeatherData;
			}
		} catch (e) {
			error = 'Failed to load weather';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
	<div class="max-w-6xl mx-auto">
		<h1 class="text-5xl font-bold text-center text-gray-800 mb-12">
			{m.app_title()}
		</h1>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Main weather section -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Search Form -->
				<form onsubmit={searchWeather} class="flex gap-2">
					<input
						type="text"
						bind:value={city}
						placeholder={m.search_placeholder()}
						class="flex-1 px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
					/>
					<button
						type="submit"
						disabled={loading}
						class="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
					>
						<SearchSolid class="w-5 h-5" />
						{loading ? m.searching() : m.search_button()}
					</button>
				</form>

				<!-- Error Message -->
				{#if error}
					<div class="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
						<p class="font-medium">{error}</p>
					</div>
				{/if}

				<!-- Weather Card -->
				{#if weather}
					<div class="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 text-white p-8 rounded-3xl shadow-2xl">
						<div class="flex justify-between items-start mb-6">
							<div>
								<h2 class="text-4xl font-bold mb-2">
									{weather.city}
								</h2>
								<p class="text-xl opacity-90">{weather.country}</p>
							</div>
							{#if data.user}
								<button
									onclick={saveFavorite}
									disabled={savingFavorite}
									class="px-5 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:bg-white/10 rounded-xl transition-all flex items-center gap-2 font-medium"
								>
									<StarSolid class="w-5 h-5" />
									{savingFavorite ? m.saving() : m.save()}
								</button>
							{/if}

						</div>

						<div class="text-7xl font-bold my-8">
							{weather.temp}°C
						</div>

						<div class="text-2xl mb-8 capitalize opacity-90">
							{weather.description}
						</div>

						<div class="grid grid-cols-2 gap-6 pt-6 border-t border-white/20">
							<div class="flex items-center gap-3">
								<div class="p-3 bg-white/20 rounded-lg">
									<BadgeCheckSolid class="w-6 h-6" />
								</div>
								<div>
									<p class="text-sm opacity-75">{m.humidity()}</p>
									<p class="text-xl font-semibold">{weather.humidity}%</p>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<div class="p-3 bg-white/20 rounded-lg">
									<BadgeCheckSolid class="w-6 h-6" />
								</div>
								<div>
									<p class="text-sm opacity-75">{m.wind_speed()}</p>
									<p class="text-xl font-semibold">{weather.windSpeed} km/h</p>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Favorites Sidebar -->
			 {#if data.user}
			 			<div class="lg:col-span-1">
				<div class="bg-white rounded-3xl shadow-xl p-6">
					<h2 class="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
						<StarSolid class="w-6 h-6 text-yellow-500" />
						{m.favorites()}
					</h2>

					{#if favorites.length === 0}
						<div class="text-center py-12">
							<StarSolid class="w-16 h-16 text-gray-300 mx-auto mb-4" />
							<p class="text-gray-500">{m.no_favorites()}</p>
							<p class="text-sm text-gray-400 mt-2">{m.no_favorites_hint()}</p>
						</div>
					{:else}
						<div class="space-y-3">
							{#each favorites as favorite (favorite.id)}
								<div class="group bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all">
									<button
										type="button"
										onclick={() => loadWeatherFromFavorite(parseFloat(favorite.lat), parseFloat(favorite.lon), favorite.cityName)}
										class="text-left w-full mb-3"
									>
										<div class="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
											{favorite.cityName}
										</div>
										<div class="text-sm text-gray-600">
											{favorite.country}
										</div>
									</button>

									<button
										type="button"
										onclick={() => deleteFavorite(favorite.id)}
										class="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
									>
										<TrashBinSolid class="w-4 h-4" />
										{m.delete()}
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
			 {/if}

		</div>
	</div>
</div>
