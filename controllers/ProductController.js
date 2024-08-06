const Product = require("../models/ProductModel");

exports.getList = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("admin/listProducts", { listProduct: products });
  } catch (err) {
    console.error(err);
  }
};

exports.shop = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("shop", { listProducts: products });
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
};

exports.getDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render("admin/detailProduct", { product });
  } catch (err) {
    console.error(err);
  }
};

exports.create = (req, res) => {
  res.render("admin/createProduct", { errors: [] });
};

exports.save = async (req, res) => {
  const { title, price, description } = req.body;
  const file = req.file;

  let errors = [];
  if (!title || title.trim() === "") errors.push("title is required");
  if (!price || isNaN(price) || price <= 0)
    errors.push("Price must be a valid number greater than 0");
  if (!description || description.trim() === "")
    errors.push("Description is required");
  if (!file) errors.push("Thumbnail is required");

  if (errors.length > 0) {
    res.render("admin/createProduct", {
      errors,
      product: { title, price, description },
    });
  } else {
    try {
      const newProduct = {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        thumbnail: req.file.filename,
      };
      const product = await Product.create(newProduct);
      if (product) {
        console.log("create successfully");
        res.redirect("/admin/listProduct");
      }
    } catch (err) {
      console.log(err);
    }
  }
};
exports.edit = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render("admin/editProduct", { product, errors: [] });
  } catch (err) {
    console.error(err);
  }
};
exports.update = async (req, res) => {
  console.log("Request Body: ", req.body);
  console.log("uploaded File: ", req.file);
  const { title, price, description } = req.body;
//   const file = req.file;

  let errors = [];
  if (!title || title.trim() === "") errors.push("title is required");
  if (!price || isNaN(price) || price <= 0)
    errors.push("Price must be a valid number greater than 0");
  if (!description || description.trim() === "")
    errors.push("Description is required");
//   if (!file) errors.push("Thumbnail is required");
  if (errors.length > 0) {
    const product = {
      _id: req.params.id,
      title,
      price,
      description,
      thumbnail: req.body.existingThumbnail,
    };
    res.render("admin/editProduct", { errors, product });
  } else {
    try {
      const updateProduct = {
        title,
        price,
        description,
        thumbnail: req.file ? req.file.filename : req.body.existingThumbnail,
      };
      await Product.findByIdAndUpdate(req.params.id, updateProduct, {
        new: true,
      });
      res.redirect("/admin/listProduct");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating product");
    }
  }
};

exports.delete = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/listProduct");
  } catch (err) {
    console.error(err);
  }
};

//Xu ly API

exports.apiGetList = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ data: products });
  } catch (errors) {
    res.status(400).json({ error: errors });
  }
};

exports.apiGetDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ data: product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.apiAddProduct = async (req, res) => {
  try {
    const newProduct = {
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      thumbnail: req.file ? req.file.filename : null,
    };

    const product = await Product.create(newProduct);
    res.status(201).json({
      message: "Add product successfully",
      data: product,
    });
  } catch (errors) {
    res.status(400).json({
      message: "Add product fail",
      error: errors,
    });
  }
};

exports.apiUpdateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const updateProduct = {
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      thumbnail: req.file ? req.file.filename : req.body.existingThumbnail,
    };

    const product = await Product.findByIdAndUpdate(id, updateProduct, {
      new: true,
    });
    if (product) {
      res.status(200).json({
        message: "Update product successfully",
        data: product,
      });
    } else {
      res.status(404).json({
        message: "Product not found",
      });
    }
  } catch (errors) {
    res.status(400).json({
      message: "Update product failed",
      error: errors,
    });
  }
};

exports.apiRemoveProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    if (product) {
      res.status(200).json({
        message: "Delete product successfully",
        data: product,
      });
    } else {
      res.status(404).json({
        message: "Product not found",
      });
    }
  } catch (errors) {
    res.status(400).json({
      message: "Delete product failed",
      error: errors,
    });
  }
};
