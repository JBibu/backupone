import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		tanstackStart({
			srcDirectory: "app",
			router: {
				routesDirectory: "routes",
			},
		}),
		nitro({
			preset: "bun",
			plugins: ["./app/server/plugins/bootstrap.ts"],
		}),
		viteReact({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
		tailwindcss(),
	],
	build: {
		outDir: "dist",
		sourcemap: false,
		rollupOptions: {
			external: ["bun"],
		},
	},
	server: {
		host: "0.0.0.0",
		port: 3000,
	},
	optimizeDeps: {
		include: [
			// dnd-kit
			"@dnd-kit/core",
			"@dnd-kit/sortable",
			"@dnd-kit/utilities",
			// forms
			"@hookform/resolvers/arktype",
			"arktype",
			"input-otp",
			"react-hook-form",
			// radix-ui
			"@radix-ui/react-alert-dialog",
			"@radix-ui/react-checkbox",
			"@radix-ui/react-collapsible",
			"@radix-ui/react-dialog",
			"@radix-ui/react-hover-card",
			"@radix-ui/react-label",
			"@radix-ui/react-progress",
			"@radix-ui/react-scroll-area",
			"@radix-ui/react-select",
			"@radix-ui/react-separator",
			"@radix-ui/react-slot",
			"@radix-ui/react-switch",
			"@radix-ui/react-tabs",
			"@radix-ui/react-tooltip",
			// data/state
			"@tanstack/react-query",
			"better-auth/client/plugins",
			"better-auth/react",
			// utilities
			"class-variance-authority",
			"clsx",
			"cron-parser",
			"date-fns",
			"es-toolkit",
			"tailwind-merge",
			// ui
			"lucide-react",
			"next-themes",
			"qrcode.react",
			"react-markdown",
			"recharts",
			"remark-gfm",
			"sonner",
		],
	},
});
