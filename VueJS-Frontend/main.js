const { createApp } = Vue;

createApp({
	data() {
		return {
			posts: [],
			loading: true,
			error: "",
			apiBaseUrl: "http://localhost:8081",
		};
	},
	computed: {
		postCountLabel() {
			const count = this.posts.length;
			return count === 1 ? "1 story" : `${count} stories`;
		},
	},
	methods: {
		async fetchPosts() {
			this.loading = true;
			this.error = "";

			try {
				const response = await fetch(`${this.apiBaseUrl}/posts`, {
					headers: {
						Accept: "application/json",
					},
				});

				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`);
				}

				const payload = await response.json();
				this.posts = Array.isArray(payload.posts) ? payload.posts : [];
			} catch (err) {
				this.error = err instanceof Error ? err.message : "Unable to load posts.";
			} finally {
				this.loading = false;
			}
		},
		formatDate(value) {
			if (!value) {
				return "Unknown date";
			}

			const date = new Date(value);
			if (Number.isNaN(date.getTime())) {
				return value;
			}

			return new Intl.DateTimeFormat("en-US", {
				dateStyle: "medium",
				timeStyle: "short",
			}).format(date);
		},
	},
	mounted() {
		this.fetchPosts();
	},
	template: `
		<main class="page">
			<section class="hero">
				<p class="badge">Hydracor Blog</p>
				<h1>Posts</h1>
				<p class="subtitle">Live feed powered by the CakePHP API endpoint <code>/posts</code>.</p>
			</section>

			<section class="panel">
				<div class="panel-header">
					<h2>Latest</h2>
					<p v-if="!loading" class="count">{{ postCountLabel }}</p>
				</div>

				<p v-if="loading" class="state">Loading posts...</p>

				<div v-else-if="error" class="state error">
					<p>Could not load posts.</p>
					<small>{{ error }}</small>
					<button type="button" @click="fetchPosts">Try again</button>
				</div>

				<p v-else-if="posts.length === 0" class="state">No posts found.</p>

				<article v-else v-for="post in posts" :key="post.id" class="card">
					<div class="card-top">
						<h3>{{ post.title }}</h3>
						<span v-if="post.published" class="chip">Published</span>
					</div>
					<p class="meta">Slug: {{ post.slug }}</p>
					<p class="body">{{ post.body }}</p>
					<p class="meta">Created: {{ formatDate(post.created) }}</p>
				</article>
			</section>
		</main>
	`,
}).mount("#app");
