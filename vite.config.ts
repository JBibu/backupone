import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouterHonoServer } from "react-router-hono-server/dev";

export default defineConfig({
	plugins: [reactRouterHonoServer({ runtime: "bun" }), reactRouter(), tailwindcss(), tsconfigPaths()],
	build: {
		outDir: "dist",
		sourcemap: false,
		rollupOptions: {
			external: ["bun"],
		},
	},
	server: {
		host: '0.0.0.0',
		port: 4096,
	},
	optimizeDeps: {
		include: [
			// dnd-kit
			'@dnd-kit/core',
			'@dnd-kit/sortable',
			'@dnd-kit/utilities',
			// forms
			'@hookform/resolvers/arktype',
			'arktype',
			'input-otp',
			'react-hook-form',
			// radix-ui
			'@radix-ui/react-alert-dialog',
			'@radix-ui/react-checkbox',
			'@radix-ui/react-collapsible',
			'@radix-ui/react-dialog',
			'@radix-ui/react-hover-card',
			'@radix-ui/react-label',
			'@radix-ui/react-progress',
			'@radix-ui/react-scroll-area',
			'@radix-ui/react-select',
			'@radix-ui/react-separator',
			'@radix-ui/react-slot',
			'@radix-ui/react-switch',
			'@radix-ui/react-tabs',
			'@radix-ui/react-tooltip',
			// data/state
			'@tanstack/react-query',
			'better-auth/client/plugins',
			'better-auth/react',
			// utilities
			'class-variance-authority',
			'clsx',
			'cron-parser',
			'date-fns',
			'es-toolkit',
			'tailwind-merge',
			// ui
			'lucide-react',
			'next-themes',
			'qrcode.react',
			'react-markdown',
			'recharts',
			'remark-gfm',
			'sonner',
		],
	},
});
