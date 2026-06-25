<template>
    <main class="home-shell">
        <a v-if="!this.isLoggedIn" class="corner-login" href="/login">Login</a>
        <header class="hero">
            <p class="eyebrow">HydraCor feed</p>
            <h1>Home</h1>
            <p class="hero-copy">Welcome {{ this.username }}</p>
            <p class="hero-meta">{{ this.posts.length }} posts available</p>
        </header>

        <section class="feed">
            <h2>Feed</h2>
            <p v-if="this.loading">Loading...</p>
            <p v-else-if="this.error">{{ this.error }}</p>
            <p v-else-if="this.posts.length === 0">No posts yet.</p>

            <article class="post-card" v-else v-for="post in this.posts" :key="post.id">
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
            isLoggedIn: false,
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

        this.isLoggedIn = !!localStorage.getItem("auth_token");

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
.home-shell {
    width: min(960px, 100%);
}

.hero {
    margin-bottom: 18px;
}

.eyebrow {
    margin: 0 0 8px;
    color: #5d74c6;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.hero h1 {
    margin-bottom: 6px;
    font-size: 42px;
    line-height: 1.05;
    color: #1f2a44;
}

.hero-copy {
    margin-bottom: 6px;
    font-size: 18px;
    color: #44506f;
}

.hero-meta {
    margin-bottom: 0;
    color: #6a7491;
    font-size: 14px;
}

.feed {
    background: rgba(247, 249, 255, 0.96);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 16px;
    box-shadow: 0 12px 34px rgba(53, 68, 116, 0.14);
    padding: 24px;
}

.feed h2 {
    margin-bottom: 16px;
    color: #1f2a44;
}

.post-card {
    padding: 16px 0;
    border-top: 1px solid rgba(45, 53, 83, 0.12);
}

.post-card:first-of-type {
    border-top: 0;
    padding-top: 0;
}

.post-card:last-child {
    padding-bottom: 0;
}

.post-card h3 {
    margin-bottom: 8px;
    color: #24304a;
}

.post-card p {
    margin-bottom: 0;
    color: #4d5873;
}

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
    box-shadow: 0 8px 18px rgba(53, 68, 116, 0.12);
}

.corner-login:hover {
    background: #f6f8ff;
    border-color: #b8c3e8;
}
</style>
