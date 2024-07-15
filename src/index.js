require("dotenv").config();

// library
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
// const multipart = require("connect-multiparty");
const multer = require("multer");
const jwt = require("jsonwebtoken");

// firebase
const {
  GetProduct,
  AddProduct,
  DeleteProduct,
  UpdateProduct,
  Login,
} = require("./lib/firebase/service");

// API
const ApiProduct = require("./api/ApiProduct");
const ApiSuccess = require("./api/ApiSuccess");
const ApiError = require("./api/ApiError");
const { ApiLoginSuccess, ApiLoginFailed } = require("./api/ApiLogin");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// middleware
const verifyToken = require("./middleware/AuthMiddleware");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", async (req, res) => {
  res.json({
    message: "Selamat datang di API Inventory App",
    status: true,
    status_code: res.statusCode,
  });
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const statusLogin = await Login(req.body, "admin");

  if (statusLogin.status) {
    jwt.sign(
      req.body,
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          res.json(err);
        } else {
          ApiLoginSuccess(
            res.statusCode,
            "success",
            statusLogin.email,
            token,
            "Login berhasil",
            res
          );
        }
      }
    );
  } else {
    ApiLoginFailed(209, "failed", "Tidak ada user ditemukan", res);
  }
});

app.get("/api/product", async (req, res) => {
  const data = await GetProduct("product");

  ApiProduct(
    res.statusCode,
    "success",
    data,
    "Berhasil menampilkan data produk",
    res
  );
});

app.post(
  "/api/add-product",
  verifyToken,
  upload.single("product_img"),
  async (req, res) => {
    const data = {
      id: req.body.id,
      product_name: req.body.product_name,
      product_stock: req.body.product_stock,
      product_price: req.body.product_price,
      product_category: req.body.product_category,
      product_unit: req.body.product_unit,
      product_expired: req.body.product_expired,
      product_description: req.body.product_description,
      createdAt: req.body.createdAt,
      updatedAt: req.body.updatedAt,
    };

    const statusAddProduct = await AddProduct(data, req.file, "product", res);

    statusAddProduct[0]
      ? ApiSuccess(200, "success", "Berhasil menambahkan produk", res)
      : ApiError(
          401,
          "failed_add",
          "Gagal menambahkan produk, silahkan coba lagi",
          statusAddProduct[1],
          res
        );
  }
);

app.delete("/api/delete-product", verifyToken, async (req, res) => {
  const { id_product, product_file_name } = req.body;
  const statusDeleteProduct = await DeleteProduct(
    id_product,
    product_file_name,
    "product"
  );

  statusDeleteProduct[0]
    ? ApiSuccess(200, "success", "Berhasil menghapus produk", res)
    : ApiError(
        401,
        "failed_delete",
        "Gagal Menghapus Produk, Silahkan coba lagi",
        statusDeleteProduct[1],
        res
      );
});

app.patch(
  "/api/update-product",
  verifyToken,
  upload.single("product_img_updated"),
  async (req, res) => {
    const updatedImages = req.file;

    const statusUpdateProduct = await UpdateProduct(
      req.body,
      updatedImages,
      "product"
    );

    statusUpdateProduct[0]
      ? ApiSuccess(200, "success", "Berhasil update produk", res)
      : ApiError(
          401,
          "failed_update",
          "Gagal update produk",
          statusUpdateProduct[1],
          res
        );
  }
);

app.listen(process.env.PORT, () => {
  console.log(`Server berjalan di http://localhost:${process.env.PORT}`);
});
