// Plugins
import vue from "@vitejs/plugin-vue";

// Utilities
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: "./",
});
