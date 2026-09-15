import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        dashboard: resolve(import.meta.dirname, "index.html"),
        products: resolve(import.meta.dirname, "products.html"),
        productForm: resolve(import.meta.dirname, "product-form.html"),
        productDetails: resolve(import.meta.dirname, "product-details.html")
      }
    }
  }
});
