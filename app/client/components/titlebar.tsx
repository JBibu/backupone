import type { LucideIcon } from "lucide-react";
import { Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isTauri } from "~/client/lib/tauri";
import { cn } from "~/client/lib/utils";

interface TauriAppWindow {
	minimize: () => Promise<void>;
	toggleMaximize: () => Promise<void>;
	close: () => Promise<void>;
	onResized: (handler: (event: { payload: { width: number; height: number } }) => void) => Promise<() => void>;
	isMaximized: () => Promise<boolean>;
}

function getAppWindow(): TauriAppWindow | undefined {
	const tauri = (window as unknown as Record<string, unknown>).__TAURI__ as
		| { window?: { getCurrentWindow: () => TauriAppWindow } }
		| undefined;
	return tauri?.window?.getCurrentWindow();
}

type WindowControlProps = {
	onClick: () => void;
	title: string;
	icon: LucideIcon;
	iconClassName?: string;
	variant?: "default" | "destructive";
};

function WindowControl({
	onClick,
	title,
	icon: Icon,
	iconClassName = "w-4 h-4",
	variant = "default",
}: WindowControlProps) {
	const hoverClass =
		variant === "destructive" ? "hover:bg-destructive hover:text-destructive-foreground" : "hover:bg-accent";

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"h-full px-4 transition-colors",
				"flex items-center justify-center",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				hoverClass,
			)}
			title={title}
		>
			<Icon className={iconClassName} />
		</button>
	);
}

export function Titlebar() {
	const { t } = useTranslation();
	const [isMaximized, setIsMaximized] = useState(false);

	useEffect(() => {
		const appWindow = getAppWindow();
		if (!appWindow) return;

		void appWindow.isMaximized().then(setIsMaximized);

		let unlisten: (() => void) | undefined;
		void appWindow
			.onResized(async () => {
				setIsMaximized(await appWindow.isMaximized());
			})
			.then((fn) => {
				unlisten = fn;
			});

		return () => unlisten?.();
	}, []);

	if (!isTauri()) return null;

	return (
		<div
			className={cn(
				"fixed top-0 left-0 right-0 z-50 h-9",
				"bg-background border-b border-border",
				"flex items-center justify-between",
				"select-none",
			)}
		>
			<div data-tauri-drag-region className="flex-1 h-full flex items-center px-4">
				<span className="text-sm font-medium text-foreground">{t("titlebar.title")}</span>
			</div>

			<div className="flex items-center h-full">
				<WindowControl onClick={() => void getAppWindow()?.minimize()} title={t("titlebar.minimize")} icon={Minus} />
				<WindowControl
					onClick={() => void getAppWindow()?.toggleMaximize()}
					title={isMaximized ? t("titlebar.restore") : t("titlebar.maximize")}
					icon={Square}
					iconClassName="w-3.5 h-3.5"
				/>
				<WindowControl
					onClick={() => void getAppWindow()?.close()}
					title={t("titlebar.close")}
					icon={X}
					variant="destructive"
				/>
			</div>
		</div>
	);
}
