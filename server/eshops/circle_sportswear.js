const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

const BASE_URL = 'https://shop.circlesportswear.com/collections/collection-homme?page='

const parseData = data => {
  const $ = cheerio.load(data)
  const products = $('.grid__item').map((i, element) => {
    const brandName = 'Circle Sportswear'
    const productName = $('h3.card__heading a', element)
      .first()
      .text()
      .trim()
      .replace(/\s+/g, ' ')
    const colors = $('.color-variant', element)
                        .map((_, e)=>$(e).attr('data-color'))
                        .get();
   const priceText = $(element)
       .find('.money')
       .first()
       .text();
   
   const priceRegex = /[+-]?\d+(\.\d+)?/g;
   const extractedPrices = priceText.match(priceRegex)
   const price = extractedPrices ? parseFloat(extractedPrices[0]) : null;

    if (price === null) return null;

    return { brand: brandName, name: productName, colors, price }
  }).get()
  .filter(product => product !== null)

  return products;
}

const fetchData = async url => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
        console.error(response)
        return [];
    }

    const body = await response.text()
    return parseData(body)
  } catch (error) {
    console.error(error)
    return []
  }
}

const scrapePages = async pageNumbers => {
  const products = []
  for (let i = 0; i < pageNumbers.length; i++) {
    const url = `${BASE_URL}${pageNumbers[i]}`
    console.log(`🕵️‍♀️  browsing ${url}`)
    const scrapedProducts = await fetchData(url)

    if (scrapedProducts.length === 0) break

    products.push(...scrapedProducts)
  }

  return products;
}

const getPageNumbersFromRange = (startPage = 1, endPage = 1) => {
  const pages = []

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
}

const writeDataToFile = async (fileName, scrapedData) => {
  try {
    const jsonData = JSON.stringify(scrapedData)
    fs.writeFile(fileName, jsonData, err => {
      if (err) throw err
      console.log('Data written to file')
    })
  } catch (error) {
    console.error(error)
  }
}

(async () => {
  const pageNumbers = getPageNumbersFromRange(1, 1)
  const scrapedData = await scrapePages(pageNumbers)
  
  console.log(scrapedData)
  
  await writeDataToFile('cs_products.json', scrapedData)
})()
