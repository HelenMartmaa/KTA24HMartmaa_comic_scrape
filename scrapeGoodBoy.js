import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getCache(name) {
    try {
        return await fs.readFile(`./cache/${name}.html`, 'utf-8');
    } catch {
        return false;
    }
}

async function setCache(name, value) {
    try {
        await fs.mkdir('./cache', { recursive: true });
        await fs.writeFile(`./cache/${name}.html`, value);
    } catch (e) {
        console.error("Cache write error:", e);
    }
}
//Numbreid saab soovi järgi muuta
async function main() {
    for (let i = 20; i > 10; i--) {
        let data = await getCache(i);
        if (!data) {
            await sleep(1000);
            console.log('!!!!!LIVE DATA', i);
            const res = await fetch(`https://hiagb.com/${i}`);
            if (res.status !== 200) {
                console.log(`Comic #${i} not found or error: ${res.status}`);
                continue;
            }
            data = await res.text();
            await setCache(i, data);
        } else {
            console.log('Cache used for', i);
        }

        const $ = cheerio.load(data);

        const imgs = [];
        let altText = '';

        $('div#comicImages img').each((_, el) => {
            let src = $(el).attr('src');
            if (src && !src.startsWith('http')) {
                src = 'https://hiagb.com/' + src;
            }
            imgs.push(src);

            // Pealkirja pole mõtet kõigilt piltidelt võtta, kuna see kõigil sama
            if (!altText) {
                altText = $(el).attr('alt') || '';
            }
        });

        if (imgs.length > 0) {
            console.log('Pictures:');
            imgs.forEach(img => console.log(img));
        } else {
            console.log('Pictures not found');
        }

        console.log('Title:', altText || 'Title missing');
        console.log('');
    }
}

main();
