import data from "./data.json";

export async function onRequestGet({ request }) {
  const url = new URL(request.url);

  const program = url.searchParams.get("program");
  const category = url.searchParams.get("category");

  if (!program || !category) {
    return new Response("Forbidden", { status: 403 });
  }

  const result = data
    .filter(d => d["PROGRAM NAME"] === program)
    .map(d => ({
      college: d["COLLEGE NAME"],
      cutoff: d[category]
    }));

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" }
  });
}
