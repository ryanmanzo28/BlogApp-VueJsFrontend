<template>
    <main>
        <header>
            <h1>Home</h1>
            <p>Welcome {{ username }}</p>
        </header>

        <section>
            <h2>Feed</h2>
            <p v-if="loading">Loading...</p>
            <p v-else-if="error">{{ error }}</p>
            <p v-else-if="posts.length === 0">No posts yet.</p>

            <article v-else v-for="post in posts" :key="post.id">
                <h3>{{ post.title || "Untitled" }}</h3>
                <p>{{ post.body || "" }}</p>
            </article>
        </section>
    </main>
</template>

<script>
import { getAllPosts } from "./api.js";

export default {
    name: "HomePage",
    data() {
        return {
            username: "username",
            posts: [],
            loading: true,
            error: "",
        };
    },
    async mounted() {
        const email = localStorage.getItem("auth_email") || "";
        if (email.includes("@")) {
            this.username = email.split("@")[0];
        }

        try {
            this.posts = await getAllPosts();
        } catch (err) {
            this.error = err instanceof Error ? err.message : "Failed to load posts.";
        } finally {
            this.loading = false;
        }
    },
};
</script>

