const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error("No file uploaded"));
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(201).json({
      message: "File uploaded successfully",
      fileUrl,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadFile,
};
