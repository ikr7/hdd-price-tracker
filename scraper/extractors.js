'use strict';

const { URL } = require('url');

const axios = require('axios');
const JSDOM = require('jsdom').JSDOM;

async function getDOM(url) {
    let res;
    try {
        res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0 kunpei.ikuta@gmail.com',
                'Referer': (new URL(url)).origin,
                'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3'
            }
        });
    } catch (e) {
        return null;
    }
    const { document } = (new JSDOM(res.data)).window;
    return document;
}

async function extractPrice(productUrl, selector) {
    if (!productUrl) {
        return null;
    }
    const document = await getDOM(productUrl);
    if (!document) {
        return null;
    }
    const priceText = document.querySelector(selector).textContent;
    const price = parseInt(priceText.replace(/\D/g, ''));
    return price;
}

exports.extractTsukumo = async function(productUrl) {
    return await extractPrice(productUrl, 'p.price strong');
}

exports.extractSofmap = async function(productUrl) {
    return await extractPrice(productUrl, 'p.price strong');
}

exports.extractPCkoubou = async function(productUrl) {
    return await extractPrice(productUrl, '#price02');
}

exports.extractDospara = async function(productUrl) {
    return await extractPrice(productUrl, 'span.num');
}