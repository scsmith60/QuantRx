import axios from 'axios';
import * as cheerio from 'cheerio';

async function testCMS() {
    console.log("Fetching CMS HTML from new URL...");
    try {
        const { data } = await axios.get('https://www.cms.gov/medicare/payment/part-b-drugs/asp-pricing-files', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });
        const $ = cheerio.load(data);
        const links = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            // Look for 2024 or 2025 or 2026 folders
            if (href && href.includes('asp-drug-pricing-files')) {
                links.push(href);
            }
        });
        console.log("Success! Found links:", links.slice(0, 5));
    } catch (e) {
        console.error("Failed:", e.message);
    }
}
testCMS();
