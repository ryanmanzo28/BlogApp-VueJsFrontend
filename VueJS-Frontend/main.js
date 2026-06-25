export async function getAllPosts() {
const API_BASE = "http://localhost:8081";
const res = await fetch(API_BASE + "/posts",{
    method: "GET",
    headers: {Accept: "application/json"},

});
if (!res.ok) {
    throw new Error("Request Failed" + res.status)

}
const data = await res.json();
return data.posts;
}
