const csvToJson = require('convert-csv-to-json');
const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
const _ = require('lodash');

const BENAVIDESURL = 'https://tiendaenlinea.benavides.com.mx/';

const db = csvToJson.fieldDelimiter(',').getJsonFromCsv('data-url-and-sku.csv');
const optimizedProducts = csvToJson.getJsonFromCsv('prueba_9_productos.csv');

const merged = _.merge(_.keyBy(db, 'sku'), _.keyBy(optimizedProducts, 'sku'));
const rawResult = _.values(merged);

const result = rawResult.filter((product) => {
  if (product.meta_title && product.meta_description) {
    return product;
  }
});

const results = [];

result.forEach((product) => {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${BENAVIDESURL}/${product.url_key}.html`);

    const content = await page.content();
    const { document } = new JSDOM(content).window;
    const { title } = document;
    const description = document.head.querySelector('meta[name=description]').content;
    await browser.close();
    results.push({
      sku: product.sku,
      url: product.url_key,
      producto: product.name,
      // title,
      description,
      rawDescription: product.meta_description,
    });
  })().then(() => console.log(optimizedProducts));
});
