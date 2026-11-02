require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const slugify = require('./slugify');

// Category tree (3 levels): Electronics > Smartphones, Clothing > Men's Wear > Kurtas ...
const tree = {
  Electronics: { Smartphones: null, Earphones: null },
  Clothing: { "Men's Wear": { Kurtas: null, Shirts: null }, "Women's Wear": { Sarees: null, Kurtis: null } },
};

// [name, brand, price in INR, extra attributes]
const catalog = {
  Smartphones: { kw: 'smartphone', items: [
    ['Samsung Galaxy M35 5G', 'Samsung', 18999, { RAM: '6 GB', Storage: '128 GB', Color: 'Moonlight Blue' }],
    ['Redmi Note 13 Pro 5G', 'Redmi', 24999, { RAM: '8 GB', Storage: '256 GB', Color: 'Arctic White' }],
    ['realme Narzo 70 Pro 5G', 'realme', 17999, { RAM: '8 GB', Storage: '128 GB', Color: 'Glass Green' }],
    ['OnePlus Nord CE4 5G', 'OnePlus', 24999, { RAM: '8 GB', Storage: '128 GB', Color: 'Celadon Marble' }],
    ['Vivo T3 5G', 'Vivo', 19999, { RAM: '8 GB', Storage: '128 GB', Color: 'Cosmic Blue' }],
    ['iQOO Z9 5G', 'iQOO', 19999, { RAM: '8 GB', Storage: '128 GB', Color: 'Brushed Green' }],
    ['Motorola G54 5G', 'Motorola', 13999, { RAM: '8 GB', Storage: '128 GB', Color: 'Pearl Blue' }],
    ['Lava Blaze 2 5G', 'Lava', 9999, { RAM: '4 GB', Storage: '64 GB', Color: 'Glass Blue' }],
  ]},
  Earphones: { kw: 'earbuds', items: [
    ['boAt Airdopes 141 Wireless Earbuds', 'boAt', 1299, { Type: 'In-ear', Battery: '42 hrs' }],
    ['Noise Buds VS104 Bluetooth Earbuds', 'Noise', 1499, { Type: 'In-ear', Battery: '30 hrs' }],
    ['boAt Rockerz 255 Pro+ Neckband', 'boAt', 1199, { Type: 'Neckband', Battery: '60 hrs' }],
    ['Boult Z40 Ultra Earbuds', 'Boult', 1499, { Type: 'In-ear', Battery: '60 hrs' }],
    ['realme Buds T300', 'realme', 2799, { Type: 'In-ear', Battery: '40 hrs' }],
    ['OnePlus Nord Buds 2', 'OnePlus', 2999, { Type: 'In-ear', Battery: '36 hrs' }],
  ]},
  Kurtas: { kw: 'kurta', items: [
    ['Cotton Straight Kurta', 'Fabindia', 1990, { Fabric: 'Cotton', Sizes: 'S, M, L, XL' }],
    ['Jacquard Silk Blend Kurta Pyjama Set', 'Manyavar', 3499, { Fabric: 'Silk Blend', Sizes: 'M, L, XL' }],
    ['Men Embroidered Kurta Set', 'Vastramay', 1999, { Fabric: 'Silk Blend', Sizes: 'M, L, XL, XXL' }],
    ['Men Solid Cotton Kurta', 'Jompers', 899, { Fabric: 'Cotton', Sizes: 'S, M, L, XL' }],
    ['Chikankari Short Kurta', 'Fabindia', 2490, { Fabric: 'Cotton', Sizes: 'M, L, XL' }],
  ]},
  Shirts: { kw: 'shirt', items: [
    ['Slim Fit Formal Shirt', 'Peter England', 1299, { Fabric: 'Cotton', Fit: 'Slim' }],
    ['Checked Casual Shirt', 'Allen Solly', 1599, { Fabric: 'Cotton', Fit: 'Regular' }],
    ['Cotton Stretch Shirt', 'Van Heusen', 1799, { Fabric: 'Cotton Stretch', Fit: 'Slim' }],
    ['Pure Linen Shirt', 'Raymond', 2499, { Fabric: 'Linen', Fit: 'Regular' }],
    ['Printed Casual Shirt', 'Louis Philippe', 2199, { Fabric: 'Cotton', Fit: 'Slim' }],
  ]},
  Sarees: { kw: 'saree', items: [
    ['Banarasi Silk Saree', 'Satrani', 1899, { Fabric: 'Banarasi Silk', Length: '6.3 m' }],
    ['Kanjivaram Silk Saree', 'Kalini', 4999, { Fabric: 'Kanjivaram Silk', Length: '6.3 m' }],
    ['Georgette Printed Saree', 'Mirchi Fashion', 1299, { Fabric: 'Georgette', Length: '5.5 m' }],
    ['Chanderi Cotton Silk Saree', 'Soch', 2999, { Fabric: 'Chanderi', Length: '6 m' }],
    ['Handloom Cotton Saree', 'Fabindia', 3290, { Fabric: 'Cotton', Length: '6 m' }],
  ]},
  Kurtis: { kw: 'kurti', items: [
    ['Printed Straight Kurta', 'Biba', 1499, { Fabric: 'Cotton', Sizes: 'S, M, L, XL' }],
    ['Anarkali Kurta', 'W', 1999, { Fabric: 'Rayon', Sizes: 'S, M, L' }],
    ['Cotton Floral Kurti', 'Libas', 899, { Fabric: 'Cotton', Sizes: 'S, M, L, XL, XXL' }],
    ['Rayon Straight Kurta', 'Aurelia', 1199, { Fabric: 'Rayon', Sizes: 'S, M, L, XL' }],
    ['Floral A-line Kurta', 'Global Desi', 1599, { Fabric: 'Cotton Blend', Sizes: 'XS, S, M, L' }],
  ]},
};

const rnd = (a, b) => a + Math.random() * (b - a);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Category.deleteMany(), Product.deleteMany()]);

  const leafIds = {};
  const build = async (nodes, parent = null) => {
    for (const [name, children] of Object.entries(nodes)) {
      const c = await Category.create({ name, slug: slugify(name), parent });
      if (children) await build(children, c._id); else leafIds[name] = c._id;
    }
  };
  await build(tree);

  const products = []; let n = 0;
  for (const [leaf, { kw, items }] of Object.entries(catalog)) {
    for (const [name, brand, price, attributes] of items) {
      n++;
      const full = leaf === 'Smartphones' || leaf === 'Earphones' ? name : `${brand} ${name}`;
      products.push({
        name: full, slug: slugify(full), brand, price, category: leafIds[leaf],
        stock: Math.random() > 0.15 ? Math.floor(rnd(3, 80)) : 0,
        rating: +rnd(3.8, 4.8).toFixed(1),
        description: `${full} by ${brand}. Genuine product with easy returns across India.`,
        tags: [leaf.toLowerCase(), brand.toLowerCase(), kw], attributes,
        image: `https://loremflickr.com/480/480/${kw}?lock=${n}`,
      });
    }
  }
  await Product.insertMany(products);
  await Product.syncIndexes();
  console.log(`Seeded ${products.length} products`);
  process.exit(0);
})();
