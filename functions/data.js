import data from "./data.json";

export async function onRequestGet() {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
