<template>
    <main>
        <a class="corner-login" href="/login">Login</a>
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
        if (window.location.pathname !== "/") {
            window.location.href = "/login";
            return;
        }

        const email = localStorage.getItem("auth_email") || "";
        if (email.includes("@")) {
            this.username = email.split("@")[0];
        } else {
            this.username = "Guest";
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

<style scoped>
.corner-login {
    position: fixed;
    top: 14px;
    right: 14px;
    padding: 8px 12px;
    border-radius: 8px;
    text-decoration: none;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #1e293b;
    font-weight: 700;
}
</style>

