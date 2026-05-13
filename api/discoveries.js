import { storage } from "./_lib/storage.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const discoveries = await storage.listDiscoveries(500);
    // Return a map of ID -> discovery_time for easy frontend consumption
    const registry = {};
    discoveries.forEach(d => {
      registry[d.id] = d.discovery_time || d.first_seen;
    });
    
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json(registry);
  } catch (error) {
    console.error("Discoveries API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
