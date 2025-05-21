import axios from "axios";

export async function scrapeLinks(links: string[]): Promise<string[]> {
  const scrapedData: string[] = [];
  for (const link of links) {
    const scrapeLink =
      `https://api.scraperapi.com/` +
      `?api_key=${process.env.SCRAPERAPI_API_KEY}` +
      `&url=${encodeURIComponent(link)}` +
      `&output_format=markdown`;
    const { data } = await axios.get(scrapeLink);
    scrapedData.push(data);
  }
  return scrapedData;
}
