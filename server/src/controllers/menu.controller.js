const Menu = require("../models/Menu");
// Get all menu items
exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Get all menu items (admin - includes suspended)
exports.getAllMenuItems = async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Get active menu items only (for customers)
exports.getActiveMenu = async (req, res) => {
  try {
    const menu = await Menu.find({ suspended: false });
    res.json(menu);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Create a new menu item
exports.createMenuItem = async (req, res) => {
  const { name, price, kitchen_id, photoUrl } = req.body;
  console.log("Received new menu item:", req.body);

  // Validate required fields
  if (!name || !price || !kitchen_id) {
    return res.status(400).send("Please provide name, price, and kitchen_id");
  }

  try {
    const newItem = new Menu({
      name,
      price,
      photoUrl: photoUrl || "",
      kitchen_id,
    });

    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Suspend a menu item
exports.suspendMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.findByIdAndUpdate(
      id,
      { suspended: true },
      { new: true }
    );
    if (!item) {
      return res.status(404).send("Menu item not found");
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Unsuspend a menu item
exports.unsuspendMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.findByIdAndUpdate(
      id,
      { suspended: false },
      { new: true }
    );
    if (!item) {
      return res.status(404).send("Menu item not found");
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
