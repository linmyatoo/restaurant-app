const Menu = require("../models/Menu");

// Get menu items (only non-suspended items for customers)
exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find({ $or: [{ isSuspended: false }, { isSuspended: { $exists: false } }] });
    res.json(menu);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Get all menu items (including suspended items - admin only)
exports.getAllMenuItems = async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Toggle suspend status of a menu item
exports.toggleSuspend = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    const menuItem = await Menu.findByIdAndUpdate(
      id,
      { isSuspended },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (err) {
    console.error(err.message);
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
      isSuspended: false, // Explicitly set to false for new items
    });

    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
