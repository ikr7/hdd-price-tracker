#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const extractors = require('./extractors');

function fileString(ts) {
    const year = ts.getUTCFullYear();
    const month = (ts.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = ts
        .getUTCDate()
        .toString()
        .toString()
        .padStart(2, '0');
    const name = `${year}-${month}-${day}`;
    return name;
}

function shuffleArray(array) {
    const shuffled = structuredClone(array);
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

async function main() {

    const hddList = (await fs.readFile(path.join(__dirname, 'hdd-list.csv')))
        .toString()
        .trim()
        .split('\r\n')
        .slice(1)
        .map(l => l.split(',').map(e => e ? e : null));

    const dataDir = path.join(__dirname, '../public/data');

    await fs.mkdir(dataDir, {
        recursive: true
    });

    const dataPath = path.join(dataDir, fileString(new Date()) + '.json');

    const entries = [];

    for (const [
        id,
        manufacturer,
        brand,
        capacity,
        rpm,
        record,
        cache,
        model,
        amazonLink,
        sofmapLink,
        tsukumoLink,
        pckoubouLink,
        dosparaLink
    ] of shuffleArray(hddList)) {

        const random_wait = 5 + 10 * Math.random();

        const [
            tsukumoPrice,
            sofmapPrice,
            pckoubouPrice,
            dosparaPrice,
            _
        ] = await Promise.all([
            extractors.extractTsukumo(tsukumoLink),
            extractors.extractSofmap(sofmapLink),
            extractors.extractPCkoubou(pckoubouLink),
            extractors.extractDospara(dosparaLink),
            new Promise((resolve) => setTimeout(resolve, random_wait * 1000))
        ]);

        const entry = {
            id: parseInt(id),
            manufacturer,
            brand,
            capacity: parseFloat(capacity),
            rpm: parseInt(rpm),
            record,
            cache: parseInt(cache),
            model,
            links: {
                tsukumo: tsukumoLink,
                sofmap: sofmapLink,
                pckoubou: pckoubouLink,
                dospara: dosparaLink
            },
            prices: {
                tsukumo: tsukumoPrice,
                sofmap: sofmapPrice,
                pckoubou: pckoubouPrice,
                dospara: dosparaPrice
            },
        };

        entries.push(entry);

        console.log(entry);

    }

    await fs.writeFile(dataPath, JSON.stringify(entries));

}

main();