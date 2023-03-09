// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const selectSort = document.querySelector('#sort-select');;
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */



const fetchProducts = async (page = 1, size = 12, productBrand = "all") => {
  try {
    let url = `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`;
    if (productBrand !== "all") {
      url += `&brand=${productBrand}`;
    }

    const response = await fetch(url);
    const body = await response.json();
    if (body.success !== true) {
      console.error(body);
      return { currentProducts, currentPagination };
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return { currentProducts, currentPagination };
  }
};

const fetchAllProducts = async() =>{
  fetchProducts(1,999999)
};

/**
 * Render list of products
 * @param  {Array} products
 */

// Initialize an empty array for holding the favorite product IDs
let favoriteProductsID = [];

const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products.map(product => {
      return `
        <div class="product" id="${product.uuid}">
          <span>${product.brand}</span>
          <a href="${product.link}">${product.name}</a>
          <span>${product.price}</span>
          <span>${product.released}</span>
          <button class="like-button" data-uuid="${product.uuid}">Add to Favorites</button>
        </div>
      `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);

};

// Function to add the current product's uuid to favoriteProductsID list
const addToFavorites = e => {
  const uuid = e.target.dataset.uuid;
  
  // check if product's id already exists in favoriteProductsID array
  if(favoriteProductsID.includes(uuid)){
    // remove product's id from favoriteProductsID array
    const indexToRemove = favoriteProductsID.indexOf(uuid);
    favoriteProductsID.splice(indexToRemove, 1);

    // update the style of the button to show it is not in favorites list
    e.target.classList.add('unliked');
    e.target.textContent = 'Add to Favorites';
  } else {
    // Add the uuid value to favoriteProductsID array
    favoriteProductsID.push(uuid); 

    // update the style of the button to show it is added to favorites list
    e.target.classList.remove('unliked'); 
    e.target.textContent = 'Added to Favorites';
  }
  console.log(favoriteProductsID); 
  renderFavorites();  
};

const renderFavorites = () => {
  const favoriteProducts = products.filter(product => favoriteProductsID.includes(product.uuid));
  const favoriteFragment = document.createDocumentFragment();
  const favoriteDiv = document.createElement('div');
  const favoriteTemplate = favoriteProducts
    .map(favoriteProduct => {
      return `
        <div class="product" id="${favoriteProduct.uuid}">
          <span>${favoriteProduct.brand}</span>
          <a href="${favoriteProduct.link}">${favoriteProduct.name}</a>
          <span>${favoriteProduct.price}</span>
          <span>${favoriteProduct.released}</span>
        </div>
      `;
    })
    .join('');

  favoriteDiv.innerHTML = favoriteTemplate;
  favoriteFragment.appendChild(favoriteDiv);
  sectionFavorites.innerHTML = '<h2>Favorite Products</h2>';
  sectionFavorites.appendChild(favoriteFragment);
}

// Adding event listeners to the like button (outside the renderProducts function)
document.addEventListener('click', event => {
  if (event.target.classList.contains('like-button')) {
    addToFavorites(event);
  }
});


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');
  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), parseInt(selectShow.value)); 
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectBrand.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(selectPage.value), parseInt(selectShow.value), event.target.value);
  console.log(products);
  const res = products.result;
  setCurrentProducts(products);
  render(currentProducts, currentPagination);

});

/*
selectBrand.addEventListener('change', async (event) => {
  const products = await fetchProducts(1, 99999);
  console.log(products);
  const res = products.result;
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});
*/
selectSort.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(selectPage.value), parseInt(selectShow.value), selectBrand.value);
  const res = products.result;

  if(event.target.value=="price-asc"){
    res.sort((a, b) => a.price - b.price);
  }
  if(event.target.value=="price-desc"){
    res.sort((a, b) => b.price - a.price);
  }
  if (event.target.value === "date-desc") {
    res.sort((a, b) => new Date(b.released) - new Date(a.released));
  }
  if (event.target.value === "date-asc") {
    res.sort((a, b) => new Date(a.released) - new Date(b.released));
  }
  
  for (const product of res) {
    console.log(product.price);
  }
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});



const currentBrands = [];
currentProducts.forEach(product => {
  const brandExists = currentBrands.some(brand => brand === product.brand);
  if (!brandExists) {
    currentBrands.push(product.brand);
  }
});

console.log(currentBrands.length); // This will log the number of brands
