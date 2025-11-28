<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { setLocale as setParaLocale, getLocale } from '$lib/paraglide/runtime';

	const LOCALE = {
		EN: 'en',
		ES: 'es',
		SV: 'sv'
	} as const;

	const changeLanguage = (lang: 'en' | 'es' | 'sv') => {
		setParaLocale(lang);
	};

	let { children, data } = $props();
</script>

<nav class="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
	<!-- Language Switcher -->
	<div class="flex gap-1">
		<button
			onclick={() => changeLanguage(LOCALE.EN)}
			class="rounded px-2 py-1 text-sm {getLocale() === LOCALE.EN
				? 'bg-blue-600 text-white'
				: 'text-gray-600 hover:bg-gray-100'}"
		>
			EN
		</button>
		<button
			onclick={() => changeLanguage(LOCALE.ES)}
			class="rounded px-2 py-1 text-sm {getLocale() === LOCALE.ES
				? 'bg-blue-600 text-white'
				: 'text-gray-600 hover:bg-gray-100'}"
		>
			ES
		</button>
		<button
			onclick={() => changeLanguage(LOCALE.SV)}
			class="rounded px-2 py-1 text-sm {getLocale() === LOCALE.SV
				? 'bg-blue-600 text-white'
				: 'text-gray-600 hover:bg-gray-100'}"
		>
			SV
		</button>
	</div>
	<a href="/" class="text-xl font-bold text-gray-800">{m.app_title()}</a>

	{#if data.user}
		<div class="flex items-center gap-4">
			<a href="/profile" class="text-gray-600 hover:text-gray-800">{data.user.username}</a>
			<form method="post" action="/auth/logout" use:enhance>
				<button class="text-red-600 hover:text-red-800">{m.logout()}</button>
			</form>
		</div>
	{:else}
		<a href="/auth/login" class="text-blue-600 hover:text-blue-800">{m.login()}</a>
	{/if}
</nav>

{@render children()}
