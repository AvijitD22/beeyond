require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");

const seedProducts = async () => {
  await connectDB();

  await Product.deleteMany({}); // clear existing

  const products = [
    {
      name: "Cold Coffee",
      price: 89,
      description: "Iced coffee with milk",
      imageUrl:
        "https://images.unsplash.com/photo-1484542959923-de288ec85ce1?w=400",
    },
    {
      name: "Veg Sandwich",
      price: 75,
      description: "Fresh veggies & cheese",
      imageUrl:
        "https://images.unsplash.com/photo-1588628522685-9780b8f00789?w=400",
    },
    {
      name: "Butter Chicken",
      price: 220,
      description: "Classic Indian curry",
      imageUrl:
        "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",
    },
    {
      name: "Masala Chai",
      price: 35,
      description: "Spiced Indian tea",
      imageUrl:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
    },
    {
      name: "Paneer Roll",
      price: 110,
      description: "Spicy paneer wrap",
      imageUrl:
        "https://media.istockphoto.com/id/1352474720/photo/fresh-paneer-roll-with-fresh-tomatos-salad-cheese-and-onions-isolated-on-bright-blue.webp?a=1&b=1&s=612x612&w=0&k=20&c=HHeBNencFEcT2ZplHH2SJ-5us8L-m8GYHmfMhoMuzaw=",
    },
    {
      name: "Margherita Pizza",
      price: 199,
      description: "Classic cheese pizza with tomato base",
      imageUrl:
        "https://images.unsplash.com/photo-1601924582975-7b9d5bcd1c59?w=400",
    },
    {
      name: "Chicken Burger",
      price: 149,
      description: "Juicy chicken patty with lettuce & mayo",
      imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    },
    {
      name: "French Fries",
      price: 99,
      description: "Crispy salted fries",
      imageUrl:
        "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400",
    },
    {
      name: "Chocolate Shake",
      price: 120,
      description: "Rich chocolate milkshake",
      imageUrl:
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
    },
    {
      name: "Veg Momos",
      price: 90,
      description: "Steamed dumplings with spicy chutney",
      imageUrl:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    },
    {
      name: "Chicken Biryani",
      price: 249,
      description: "Aromatic rice with spicy chicken",
      imageUrl:
        "https://images.unsplash.com/photo-1631515242808-497c3fbd397c?w=400",
    },
    {
      name: "Paneer Butter Masala",
      price: 210,
      description: "Creamy tomato gravy with paneer",
      imageUrl:
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
    },
    {
      name: "Samosa (2 pcs)",
      price: 40,
      description: "Crispy snack with potato filling",
      imageUrl:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    },
    {
      name: "Ice Cream Sundae",
      price: 130,
      description: "Vanilla ice cream with chocolate syrup",
      imageUrl:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
    },
    {
      name: "Orange Juice",
      price: 70,
      description: "Freshly squeezed orange juice",
      imageUrl:
        "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400",
    },
  ];

  await Product.insertMany(products);
  console.log("Products seeded!");
  process.exit(0);
};

seedProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});
