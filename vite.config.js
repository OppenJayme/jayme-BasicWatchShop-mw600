import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: { '/api': 'http://127.0.0.1:3000' }
  },
  preview: {
    proxy: { '/api': 'http://127.0.0.1:3000' }
  },
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
