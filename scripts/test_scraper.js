import axios from 'axios';
import * as cheerio from 'cheerio';

async function testCMS() {
    console.log("Fetching CMS HTML...");
    try {
        const { data } = await axios.get('https://www.cms.gov/medicare/medicare-part-b-drug-average-sales-price/2024-asp-drug-pricing-files', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });
        const $ = cheerio.load(data);
        const links = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('.zip')) {
                links.push(href);
            }
        });
        console.log("Found zip links:", links);
    } catch (e) {
        console.error("Failed:", e.message);
    }
}
testCMS();
