require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const seedProducts = async () => {
  await connectDB();

  await Product.deleteMany({}); // clear existing

  const products = [
    { name: 'Cold Coffee', price: 89, description: 'Iced coffee with milk', imageUrl: 'https://images.unsplash.com/photo-1484542959923-de288ec85ce1?w=400' },
    { name: 'Veg Sandwich', price: 75, description: 'Fresh veggies & cheese', imageUrl: 'https://images.unsplash.com/photo-1588628522685-9780b8f00789?w=400' },
    { name: 'Butter Chicken', price: 220, description: 'Classic Indian curry', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
    { name: 'Masala Chai', price: 35, description: 'Spiced Indian tea', imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400' },
    { name: 'Paneer Roll', price: 110, description: 'Spicy paneer wrap', imageUrl: 'https://media.istockphoto.com/id/1352474720/photo/fresh-paneer-roll-with-fresh-tomatos-salad-cheese-and-onions-isolated-on-bright-blue.webp?a=1&b=1&s=612x612&w=0&k=20&c=HHeBNencFEcT2ZplHH2SJ-5us8L-m8GYHmfMhoMuzaw=' },
  ];

  await Product.insertMany(products);
  console.log('Products seeded!');
  process.exit(0);
};

seedProducts().catch(err => {
  console.error(err);
  process.exit(1);
});