import { spawn, execFile, type ExecException, type ExecFileOptions } from "node:child_process";
import { createInterface } from "node:readline";
import { promisify } from "node:util";
import { IS_WINDOWS, EXE_SUFFIX, getDefaultPath } from "../core/platform";

/**
 * Get the binary name with platform-appropriate extension
 * @param name - The base name of the binary (e.g., "restic", "rclone")
 * @returns The binary name with .exe suffix on Windows
 */
export const getBinaryName = (name: string): string => {
	return IS_WINDOWS ? `${name}${EXE_SUFFIX}` : name;
};

type ExecProps = {
	command: string;
	args?: string[];
	env?: NodeJS.ProcessEnv;
} & ExecFileOptions;

export const exec = async ({ command, args = [], env = {}, ...rest }: ExecProps) => {
	const options = {
		env: { ...process.env, ...env, PATH: env.PATH || getDefaultPath() },
	};

	// On Windows, automatically add .exe suffix if not present
	const effectiveCommand = IS_WINDOWS && !command.endsWith(".exe") && !command.includes("/") && !command.includes("\\")
		? getBinaryName(command)
		: command;

	try {
		const { stdout, stderr } = await promisify(execFile)(effectiveCommand, args, { ...options, ...rest, encoding: "utf8" });

		return { exitCode: 0, stdout, stderr };
	} catch (error) {
		const execError = error as ExecException;

		return {
			exitCode: typeof execError.code === "number" ? execError.code : 1,
			stdout: execError.stdout || "",
			stderr: execError.stderr || "",
		};
	}
};

export interface SafeSpawnParams {
	command: string;
	args: string[];
	env?: NodeJS.ProcessEnv;
	signal?: AbortSignal;
	onStdout?: (line: string) => void;
	onStderr?: (error: string) => void;
}

type SpawnResult = {
	exitCode: number;
	summary: string;
	error: string;
};

export const safeSpawn = (params: SafeSpawnParams) => {
	const { command, args, env = {}, signal, onStdout, onStderr } = params;

	// On Windows, automatically add .exe suffix if not present
	const effectiveCommand = IS_WINDOWS && !command.endsWith(".exe") && !command.includes("/") && !command.includes("\\")
		? getBinaryName(command)
		: command;

	let lastStdout = "";
	let lastStderr = "";

	return new Promise<SpawnResult>((resolve) => {
		const child = spawn(effectiveCommand, args, {
			env: { ...process.env, ...env, PATH: env.PATH || getDefaultPath() },
			signal: signal,
		});

		child.stdout.setEncoding("utf8");
		child.stderr.setEncoding("utf8");

		const rl = createInterface({ input: child.stdout });
		const rlErr = createInterface({ input: child.stderr });

		rl.on("line", (line) => {
			if (onStdout) onStdout(line);
			const trimmed = line.trim();
			if (trimmed.length > 0) {
				lastStdout = line;
			}
		});

		rlErr.on("line", (line) => {
			if (onStderr) onStderr(line);
			const trimmed = line.trim();
			if (trimmed.length > 0) {
				lastStderr = line;
			}
		});

		child.on("error", (err) => {
			resolve({ exitCode: -1, summary: lastStdout, error: err.message || lastStderr });
		});

		child.on("close", (code) => {
			resolve({ exitCode: code ?? -1, summary: lastStdout, error: lastStderr });
		});
	});
};
