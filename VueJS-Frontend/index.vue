<template>
    <main class="home-shell">
        <a
            class="profile-button"
            :href="this.isLoggedIn ? '/profile.html' : '/login'"
            aria-label="Profile"
        >
            <span class="profile-button__ring">
                <span class="profile-button__head"></span>
                <span class="profile-button__body"></span>
            </span>
        </a>
        <a v-if="!this.isLoggedIn" class="corner-login" href="/login">Login</a>
        <a v-if="this.isLoggedIn" class="compose-button" href="/write.html" aria-label="Write a new post">+</a>
        <header class="hero">
            <p class="eyebrow">HydraCor feed</p>
            <h1>Home</h1>
            <p class="hero-copy">Welcome {{ this.username }}</p>
            <p class="hero-meta">{{ this.posts.length }} posts available</p>
        </header>

        <section class="feed">
            <div class="feed-toolbar">
                <h2>Feed</h2>
                <button
                    class="feed-refresh"
                    type="button"
                    :disabled="this.isRefreshing"
                    @click="this.loadPosts({ silent: true })"
                >
                    {{ this.isRefreshing ? "Refreshing..." : "Refresh" }}
                </button>
            </div>
            <p v-if="this.loading" class="feed-state">Loading...</p>
            <p v-else-if="this.error" class="feed-state">{{ this.error }}</p>
            <p v-else-if="this.posts.length === 0" class="feed-state">No posts yet.</p>

            <a
                class="post-card"
                v-else
                v-for="post in this.posts"
                :key="post.id"
                :href="`/article.html?id=${post.id}`"
            >
                <h3>{{ post.title || "Untitled" }}</h3>
                <p>{{ this.getExcerpt(post.body || "") }}</p>
                <span class="read-more">Read more</span>
            </a>
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
            isRefreshing: false,
            posts: [],
            loading: true,
            error: "",
        };
    },
    async mounted() {
        this.isLoggedIn = !!localStorage.getItem("auth_token");

        const email = localStorage.getItem("auth_email") || "";
        if (email.includes("@")) {
            this.username = email.split("@")[0];
        } else {
            this.username = "Guest";
        }

        await this.loadPosts();
    },
    methods: {
        async loadPosts({ silent = false } = {}) {
            if (silent) {
                this.isRefreshing = true;
            } else {
                this.loading = true;
            }

            this.error = "";

            try {
                this.posts = await getAllPosts();
            } catch (err) {
                this.error = err instanceof Error ? err.message : "Failed to load posts.";
            } finally {
                this.loading = false;
                this.isRefreshing = false;
            }
        },
        getExcerpt(body) {
            const text = String(body || "").trim();
            if (!text) {
                return "";
            }

            const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
            const excerpt = sentences.slice(0, 2).join(" ").trim();
            if (excerpt) {
                return excerpt.length > 180 ? `${excerpt.slice(0, 177).trimEnd()}...` : excerpt;
            }

            const words = text.split(/\s+/);
            if (words.length <= 24) {
                return text;
            }

            return `${words.slice(0, 24).join(" ")}...`;
        },
    },
};
</script>

<style scoped>
.home-shell {
    width: min(860px, 100%);
    margin-top: 22px;
}

.hero {
    margin-bottom: 16px;
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
    height: min(620px, calc(100vh - 220px));
    overflow-y: auto;
    padding: 24px;
    scrollbar-gutter: stable;
}

.feed::-webkit-scrollbar {
    width: 10px;
}

.feed::-webkit-scrollbar-track {
    background: rgba(45, 53, 83, 0.06);
    border-radius: 999px;
}

.feed::-webkit-scrollbar-thumb {
    background: rgba(93, 116, 198, 0.55);
    border-radius: 999px;
}

.feed::-webkit-scrollbar-thumb:hover {
    background: rgba(93, 116, 198, 0.75);
}

.feed-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 2px;
}

.feed h2 {
    margin-bottom: 12px;
    color: #1f2a44;
}

.feed-refresh {
    width: auto;
    margin: 0 0 10px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    background: #ffffff;
    color: #2d3553;
    border: 1px solid #c0c8ea;
    cursor: pointer;
}

.feed-refresh:hover {
    background: #f4f7ff;
}

.feed-refresh:disabled {
    cursor: not-allowed;
    opacity: 0.72;
}

.feed-state {
    margin: 8px 0 0;
    color: #59607a;
    font-weight: 600;
}

.post-card {
    display: block;
    text-decoration: none;
    padding: 16px 0;
    border-top: 1px solid rgba(45, 53, 83, 0.12);
    transition:
        transform 180ms ease,
        box-shadow 180ms ease,
        background-color 180ms ease,
        border-color 180ms ease,
        color 180ms ease;
}

.post-card:first-of-type {
    border-top: 0;
    padding-top: 0;
}

.post-card:last-child {
    padding-bottom: 0;
}

.post-card h3 {
    margin-bottom: 6px;
    color: #24304a;
}

.post-card p {
    margin-bottom: 0;
    color: #4d5873;
    line-height: 1.55;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.post-card:hover {
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 16px 30px rgba(53, 68, 116, 0.12);
    transform: translateY(-4px);
    border-radius: 18px;
    border-color: rgba(93, 116, 198, 0.18);
    padding-left: 14px;
    padding-right: 14px;
    margin-left: -14px;
    margin-right: -14px;
}

.post-card:hover .read-more {
    color: #4f6ed9;
}

.post-card:hover h3 {
    color: #1f2a44;
}

.post-card:focus-visible {
    outline: 3px solid rgba(93, 116, 198, 0.36);
    outline-offset: 4px;
    border-radius: 12px;
}

.read-more {
    display: inline-block;
    margin-top: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #6a7491;
}

.corner-login {
    position: fixed;
    top: 58px;
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

.corner-login:focus-visible,
.profile-button:focus-visible,
.compose-button:focus-visible {
    outline: 3px solid rgba(93, 116, 198, 0.36);
    outline-offset: 3px;
}

.profile-button {
    position: fixed;
    top: 8px;
    right: 8px;
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid #cbd5e1;
    box-shadow: 0 10px 20px rgba(53, 68, 116, 0.12);
    text-decoration: none;
    transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.profile-button__ring {
    position: relative;
    width: 20px;
    height: 20px;
    display: block;
}

.profile-button__head {
    position: absolute;
    top: 1px;
    left: 6px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #5470d6;
}

.profile-button__body {
    position: absolute;
    left: 2px;
    bottom: 1px;
    width: 16px;
    height: 9px;
    border-radius: 999px 999px 6px 6px;
    background: #5470d6;
}

.profile-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 24px rgba(64, 93, 196, 0.18);
    background: #f6f8ff;
}

.compose-button {
    position: fixed;
    right: 18px;
    bottom: 18px;
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    text-decoration: none;
    background: linear-gradient(180deg, #7f9cf7 0%, #5f7ee8 100%);
    border: 1px solid rgba(255, 255, 255, 0.58);
    color: #ffffff;
    font-size: 30px;
    line-height: 1;
    font-weight: 700;
    box-shadow:
        0 16px 30px rgba(64, 93, 196, 0.34),
        0 4px 0 rgba(255, 255, 255, 0.12) inset;
    transform: translateY(0);
    transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.compose-button:hover {
    filter: brightness(1.06);
    transform: translateY(-6px) scale(1.03);
    box-shadow:
        0 24px 42px rgba(64, 93, 196, 0.42),
        0 8px 0 rgba(255, 255, 255, 0.14) inset;
}

.compose-button:active {
    transform: translateY(-2px) scale(1.01);
}

@media (max-width: 760px) {
    .home-shell {
        margin-top: 12px;
    }

    .hero h1 {
        font-size: 34px;
    }

    .hero-copy {
        font-size: 16px;
    }

    .feed {
        height: min(560px, calc(100vh - 210px));
        padding: 18px;
    }

    .feed-toolbar {
        align-items: flex-start;
    }

    .feed h2 {
        margin-bottom: 10px;
    }

    .compose-button {
        width: 50px;
        height: 50px;
        right: 14px;
        bottom: 14px;
    }
}
</style>
