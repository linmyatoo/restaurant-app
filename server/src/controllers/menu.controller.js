const Menu = require('../models/Menu');

// Get all menu items
exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Create a new menu item
exports.createMenuItem = async (req, res) => {
  const { name, price, photoUrl, kitchen_id } = req.body;

  try {
    const newItem = new Menu({
      name,
      price,
      photoUrl,
      kitchen_id,
    });

    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};