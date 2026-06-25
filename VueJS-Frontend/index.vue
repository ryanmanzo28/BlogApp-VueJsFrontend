<template>
    <div>
        <h1>Feed</h1>
        <p v-if="loading">Loading...</p>
        <p v-else-if="error">{{ error }}</p>
        <div v-else v-for="post in posts" :key="post.id">{{ post.title }}</div>
    </div>
</template>

<script>
import { getAllPosts } from "./api.js";

export default {
    name: "FeedPage",
    data() {
        return {
            posts: [],
            loading: true,
            error: "",
        };
    },
    async mounted() {
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

