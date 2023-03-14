const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');


const BASE_URL = 'https://www.dedicatedbrand.com/en/men/all-men#page=';

const parse = data => {
    const $ = cheerio.load(data);
  
    return $('.productList-container .productList')
      .map((i, element) => {
        const brand = "Dedicated";
        const name = $(element)
          .find('.productList-title')
          .text()
          .trim()
          .replace(/\s/g, ' ');
        const title = $(element)
          .find('.productList-title')
          .text()
          .trim();
        const color = title.split(' ').pop();
        const price = parseFloat(
          $(element)
            .find('.productList-price')
            .text()
        );
  
        return {brand, name, price, color};
      })
      .get();
  };

const scrape = async (url) => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const body = await response.text();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const scrapeAllPagesD = async (startPage, endPage) => {
  const allProducts = [];

  for (let i = startPage; i <= endPage; i++) {
    const url = BASE_URL + i;
    console.log(`🕵️‍♀️  browsing ${url}`);

    const products = await scrape(url);

    if (products && products.length > 0) {
      allProducts.push(...products);
    } else {
      break;
    }
  }

  return allProducts;
};

const scrapeAllDataDedicated = async () => {
  const scrapedDataD = await scrapeAllPagesD(1, 17);
  console.log(scrapedDataD);

  return scrapedDataD;
}

const writeDataToFile = async () => {
  try {
    const dedicated_products = await scrapeAllDataDedicated();
    const dedicatedjson = JSON.stringify(dedicated_products);
    //console.log( dedicatedjson);
    fs.writeFile('dedicated_products.json', dedicatedjson, (err) => {
      if (err) throw err;
      console.log('Data written to file-------');
    });
  } catch (error) {
    console.error(error);
  }
}

writeDataToFile();

