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
import { getAllPosts, getCurrentUser } from "./api.js";

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
        const token = localStorage.getItem("auth_token") || "";
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const user = await getCurrentUser();
            const email = user?.email || localStorage.getItem("auth_email") || "";

            if (email.includes("@")) {
                this.username = email.split("@")[0];
            }

            this.posts = await getAllPosts();
        } catch (err) {
            if (err instanceof Error && err.message === "Unauthorized") {
                window.location.href = "/login";
                return;
            }

            this.error = err instanceof Error ? err.message : "Failed to load posts.";
        } finally {
            this.loading = false;
        }
    },
};
</script>

