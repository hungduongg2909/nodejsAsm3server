const Product = require("../models/Product");

exports.getAllProducts = async (req, res) => {
   try {
      const products = await Product.find();
      res.status(200).json(products);
   } catch (error) {
      console.error("Error BE getAllProducts", error);
      res.status(500).json({ message: "Error BE getAllProducts" });
   }
};

exports.getProductById = async (req, res) => {
   const { id } = req.params;
   try {
      const product = await Product.findById(id);
      if (!product) {
         return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
   } catch (error) {
      console.error("Error BE getProductById", error);
      res.status(500).json({ message: "Error BE getProductById" });
   }
};

exports.getPaginatedProducts = async (req, res) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const count = parseInt(req.query.count) || 8;
      const search = req.query.search || "";
      const category = req.query.category || "all";

      const skip = (page - 1) * count;

      // Tạo điều kiện tìm kiếm
      let query = {};

      if (search) {
         query.name = { $regex: search, $options: "i" }; // tìm theo tên, không phân biệt hoa thường
      }

      if (category !== "all") {
         query.category = category;
      }

      const products = await Product.find(query).skip(skip).limit(count);

      res.status(200).json(products);
   } catch (error) {
      console.error("Error getPaginatedProducts: ", error);
      res.status(500).json({ message: "Error BE getPaginatedProducts" });
   }
};

exports.postAddProduct = async (req, res) => {
   try {
      const { name, category, short_desc, long_desc, price, countInStock } = req.body;
		// console.log("req.body", req.body);
      const files = req.files;

      if (files.length !== 4) {
         return res
            .status(400)
            .json({ message: "Please upload exactly 4 images" });
      }

      const newProduct = new Product({
         name,
         category,
         short_desc,
         long_desc,
         price,
         countInStock,
         img1: "/images/" + files[0].filename,
         img2: "/images/" + files[1].filename,
         img3: "/images/" + files[2].filename,
         img4: "/images/" + files[3].filename,
      });

      await newProduct.save();
      res.status(201).json({ message: "Product created successfully" });
   } catch (error) {
      console.error("Error BE postAddProduct", error);
      res.status(500).json({ message: "Error BE postAddProduct" });
   }
};

exports.updateProduct = async (req, res) => {
   try {
      const { name, category, short_desc, long_desc, price, countInStock } = req.body;

      const updated = await Product.findByIdAndUpdate(
         req.params.id,
         { name, category, short_desc, long_desc, price, countInStock },
         { new: true, runValidators: true }
      );

      if (!updated) return res.status(404).json({ message: "Product not found" });

      res.status(200).json({ message: "Update successful", product: updated });
   } catch (err) {
      console.error("Error BE updating product", err);
      res.status(500).json({ message: "Error BE updating product", err });
   }
};

exports.deleteProduct = async (req, res) => {
   try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted)
         return res.status(404).json({ message: "Product not found" });

      res.status(200).json({ message: "Delete successful" });
   } catch (err) {
      console.error("Error BE deleting product", err);
      res.status(500).json({ message: "Error BE deleting product", err });
   }
};
