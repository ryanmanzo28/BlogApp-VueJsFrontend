<template>
    <main>
        <header>
            <h1>Home</h1>
            <p>Welcome {{ this.username }}</p>
        </header>

        <section>
            <h2>Feed</h2>
            <p v-if="this.loading">Loading...</p>
            <p v-else-if="this.error">{{ this.error }}</p>
            <p v-else-if="this.posts.length === 0">No posts yet.</p>

            <article v-else v-for="post in this.posts" :key="post.id">
                <h3>{{ post.title || "Untitled" }}</h3>
                <p>{{ post.body || "" }}</p>
            </article>
        </section>
    </main>
</template>

<script>
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("auth_token")) {
        alert("You are not logged in. Please log in to access the home page.");
        window.location.href = "/login";
    }
})
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

