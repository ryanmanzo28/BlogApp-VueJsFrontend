<template>
    <main>
        <header>
            <h1>Home</h1>
            <p>Welcome {{ username }}</p>
        </header>

        <section>
            <h2>Feed</h2>
            <article>
                <h3>Post title</h3>
                <p>Post body preview...</p>
            </article>
            <article>
                <h3>Post title</h3>
                <p>Post body preview...</p>
            </article>
        </section>
    </main>
</template>

<script>
export default {
    name: "HomePage",
    data() {
        return {
            username: "username",
        };
    },
    mounted() {
        const email = localStorage.getItem("auth_email") || "";
        if (email.includes("@")) {
            this.username = email.split("@")[0];
        }
    },
};
</script>

