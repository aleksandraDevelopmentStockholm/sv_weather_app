<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Track if we're editing
	let isEditing = $state(false);
</script>

<svelte:head>
	<title>{m.profile()} | {m.app_title()}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
	<div class="mx-auto max-w-md">
		<div class="rounded-3xl bg-white p-8 shadow-xl">
			<h1 class="mb-8 text-3xl font-bold text-gray-800">{m.profile()}</h1>

			<!-- Success message -->
			{#if form?.success}
				<div
					role="alert"
					class="mb-6 rounded-xl border-2 border-green-200 bg-green-50 p-4 text-green-700"
				>
					{form.message}
				</div>
			{/if}

			<!-- Error message -->
			{#if form?.message && !form?.success}
				<div
					role="alert"
					class="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-red-700"
				>
					{form.message}
				</div>
			{/if}

			<!-- User info -->
			<div class="space-y-6">
				<div>
					<span class="mb-1 block text-sm font-medium text-gray-500">{m.user_id()}</span>
					<p aria-label={m.user_id()} class="rounded-lg bg-gray-100 p-3 font-mono text-sm text-gray-800">
						{data.user.id}
					</p>
				</div>

				{#if isEditing}
					<!-- Edit mode -->
					<form method="post" action="?/updateUsername" use:enhance class="space-y-4">
						<div>
							<label for="username" class="mb-1 block text-sm font-medium text-gray-500">
								{m.username()}
							</label>
							<input
								type="text"
								id="username"
								name="username"
								value={form?.username ?? data.user.username}
								class="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
							/>
						</div>
						<div class="flex gap-3">
							<button
								type="submit"
								class="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
							>
								{m.save()}
							</button>
							<button
								type="button"
								onclick={() => (isEditing = false)}
								class="flex-1 rounded-xl bg-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-300"
							>
								{m.cancel()}
							</button>
						</div>
					</form>
				{:else}
					<!-- View mode -->
					<div>
						<label for="userName" class="mb-1 block text-sm font-medium text-gray-500"
							>{m.username()}</label
						>
						<p id="userName" class="text-lg font-semibold text-gray-800">{data.user.username}</p>
					</div>
					<button
						onclick={() => (isEditing = true)}
						class="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
					>
						{m.edit_username()}
					</button>
				{/if}
			</div>

			<!-- Back link -->
			<a
				aria-label={m.back_to_weather()}
				href="/"
				class="mt-8 block text-center text-blue-600 hover:underline"
			>
				← {m.back_to_weather()}
			</a>
		</div>
	</div>
</div>
