const cloudinary = require("cloudinary").v2;

// Upload image (base64 data URL) to Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    const { image } = req.body; // expecting a data URL (base64)
    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "restaurant_app",
    });

    return res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("uploadImage error", err);
    return res.status(500).json({ message: "Image upload failed" });
  }
};
