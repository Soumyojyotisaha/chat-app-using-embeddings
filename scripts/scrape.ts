import axios from 'axios';
import * as cheerio from 'cheerio';
import { encode } from 'gpt-3-encoder';
import { PGChunk } from './types';

interface PGEssay {
    title: string;
    url: string;
    date: string;
    content: string;
    tokens: number;
    chunks: string[];
}

const BASE_URL = "http://www.paulgraham.com";
const CHUNK_SIZE = 200;

const getLinks = async () => {
    const html = await axios.get(`${BASE_URL}/articles.html`);
    const $ = cheerio.load(html.data);
    const tables = $("table");
    const linkArr: { url: string; title: string }[] = [];

    tables.each((i, table) => {
        if (i === 2) {
            const links = $(table).find("a");
            links.each((j, link) => {
                const url = $(link).attr('href');
                const title = $(link).text();

                if (url && url.endsWith(".html") && title) {
                    const linkObj = {
                        url,
                        title
                    };
                    linkArr.push(linkObj);
                }
            });
        }
    });

    console.log(linkArr);
    return linkArr;
};

const getEssay = async (linkObj: { url: string; title: string }) => {
    const { title, url } = linkObj;

    let essay: PGEssay = {
        title: "",
        url: "",
        date: "",
        content: "",
        tokens: 0,
        chunks: []
    };

    const essayHtml = await axios.get(`${BASE_URL}/${url}`);
    const $ = cheerio.load(essayHtml.data);
    const tables = $("table");

    tables.each((i, table) => {
        if (i === 1) {
            const text = $(table).text();

            let cleanedText = text.replace(/\s+/g, " ").replace(/\.([a-zA-Z])/g, ". $1");

            const split = cleanedText.match(/(\d{1,2} [a-zA-Z]+ \d{4})/); // Regular expression for matching the date

            let dateStr = "";
            let textWithoutDate = cleanedText;

            if (split) {
                dateStr = split[0];
                textWithoutDate = cleanedText.replace(dateStr, "");
            }

            const essayText = textWithoutDate.replace(/\n/g, " ").trim();

            essay = {
                title,
                url: `${BASE_URL}/${url}`,
                date: dateStr.trim(),
                content: essayText,
                tokens: encode(essayText).length,
                chunks: []
            };
        }
    });

    console.log(essay);
    return essay;
};

const getChunks = async (essay: PGEssay) => {
    const { title, url, date, content } = essay;
    let essayTextChunks: string[] = [];

    if (encode(content).length > CHUNK_SIZE) {
        const split = content.split(". ");
        let chunkText = "";

        for (let i = 0; i < split.length; i++) {
            const sentence = split[i];
            const sentenceTokenLength = encode(sentence).length;
            const chunkTextTokenLength = encode(chunkText).length;

            if (chunkTextTokenLength + sentenceTokenLength > CHUNK_SIZE) {
                essayTextChunks.push(chunkText);
                chunkText = "";
            }

            if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
                chunkText += sentence + ".";
            } else {
                chunkText += sentence + " ";
            }
        }

        essayTextChunks.push(chunkText.trim());
    } else {
        essayTextChunks.push(content.trim());
    }

    const essayChunks: PGChunk[] = essayTextChunks.map((chunkText, i) => {
        const chunk: PGChunk = {
            essay_title: title,
            essay_url: url,
            essay_date: date,
            content: chunkText,
            content_tokens: encode(chunkText).length,
            embedding: []
        };
        return chunk;
    });

    if (essayChunks.length > 1) {
        for (let i = 0; i < essayChunks.length; i++) {
            const chunk = essayChunks[i];
            const prevChunk = essayChunks[i - 1];
            if (chunk.content_tokens < 100 && prevChunk) {
                prevChunk.content += " " + chunk.content;
                prevChunk.content_tokens = encode(prevChunk.content).length;
                essayChunks.splice(i, 1);
            }
        }
    }

    return essayChunks; // Add this line to return the essayChunks
};

(async () => {
    const links = await getLinks();
    let essays: PGEssay[] = [];

    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const essay = await getEssay(link);
        essays.push(essay);

        // Add this line to get and log the essay chunks
        const essayChunks = await getChunks(essay);
        console.log(essayChunks);
    }
})();
