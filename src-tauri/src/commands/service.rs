use crate::SERVICE_PORT;
use serde::{Deserialize, Serialize};
use std::time::Duration;
#[cfg(target_os = "windows")]
use tracing::info;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceStatus {
    pub installed: bool,
    pub running: bool,
    pub start_type: Option<String>,
}

/// Helper to create and execute an elevated batch script for service operations.
/// Waits up to 10 seconds for the script to produce a log indicating success or error.
#[cfg(target_os = "windows")]
async fn execute_elevated_script(
    script_name: &str,
    script_content: String,
    log_path: &std::path::Path,
    success_message: &str,
) -> Result<(), String> {
    use tokio::time::sleep;

    let temp_dir = std::env::temp_dir();
    let script_path = temp_dir.join(script_name);

    std::fs::write(&script_path, script_content)
        .map_err(|e| format!("Failed to write {} script: {}", script_name, e))?;

    run_elevated(&script_path.to_string_lossy())?;

    info!(
        "Script {} initiated, waiting for completion...",
        script_name
    );

    // Poll for the log file to contain a completion marker
    for _ in 0..10 {
        sleep(Duration::from_secs(1)).await;
        if let Ok(content) = std::fs::read_to_string(log_path) {
            if content.contains(success_message) || content.contains("ERROR:") {
                break;
            }
        }
    }

    if let Ok(content) = std::fs::read_to_string(log_path) {
        if content.contains("ERROR:") {
            return Err(format!(
                "Operation failed. Check log file for details: {}",
                log_path.display()
            ));
        }
    }

    Ok(())
}

/// Get the current status of the Windows Service
#[tauri::command]
pub async fn get_service_status() -> Result<ServiceStatus, String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        use std::process::Command;

        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let output = Command::new("sc")
            .args(["query", "C3iBackupONE"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| format!("Failed to query service: {}", e))?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        // Error 1060 means the service does not exist
        if stderr.contains("1060") || stdout.contains("1060") {
            return Ok(ServiceStatus {
                installed: false,
                running: false,
                start_type: None,
            });
        }

        let running = stdout.contains("RUNNING");

        let qc_output = Command::new("sc")
            .args(["qc", "C3iBackupONE"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .ok();

        let start_type = qc_output.and_then(|out| {
            let stdout = String::from_utf8_lossy(&out.stdout);
            if stdout.contains("AUTO_START") {
                Some("automatic".to_string())
            } else if stdout.contains("DEMAND_START") {
                Some("manual".to_string())
            } else if stdout.contains("DISABLED") {
                Some("disabled".to_string())
            } else {
                None
            }
        });

        Ok(ServiceStatus {
            installed: true,
            running,
            start_type,
        })
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(ServiceStatus {
            installed: false,
            running: false,
            start_type: None,
        })
    }
}

/// Check if the Windows Service is running by trying to connect to its healthcheck port
#[tauri::command]
pub async fn is_service_running() -> Result<bool, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!("http://localhost:{}/healthcheck", SERVICE_PORT);
    match client.get(&url).send().await {
        Ok(response) => Ok(response.status().is_success()),
        Err(_) => Ok(false),
    }
}

/// Install the Windows Service (requires elevation)
#[tauri::command]
pub async fn install_service(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::env;
        use tauri::Manager;

        let exe_dir = app
            .path()
            .resource_dir()
            .map_err(|e| format!("Failed to get resource directory: {}", e))?;

        let binaries_dir = exe_dir.join("binaries");
        let candidates = [
            binaries_dir.join("zerobyte-service-x86_64-pc-windows-msvc.exe"),
            binaries_dir.join("zerobyte-service.exe"),
        ];

        let service_exe = candidates
            .iter()
            .find(|path| path.exists())
            .ok_or_else(|| {
                format!(
                    "Service executable not found in: {}",
                    binaries_dir.display()
                )
            })?;

        info!("Installing service from: {}", service_exe.display());

        let temp_dir = env::temp_dir();
        let log_path = temp_dir.join("zerobyte_service_install.log");
        let _ = std::fs::remove_file(&log_path);

        let script = format!(
            r#"@echo off
echo Installing service... > "{log}"
sc create C3iBackupONE binPath= "{exe}" start= auto DisplayName= "C3i Backup ONE Service" >> "{log}" 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to create service >> "{log}"
    exit /b %errorlevel%
)
sc description C3iBackupONE "Background backup service for C3i Backup ONE" >> "{log}" 2>&1
sc start C3iBackupONE >> "{log}" 2>&1
echo Installation complete >> "{log}"
"#,
            exe = service_exe.display(),
            log = log_path.display()
        );

        execute_elevated_script(
            "zerobyte_install_service.bat",
            script,
            &log_path,
            "Installation complete",
        )
        .await?;

        let status = get_service_status().await?;

        if !status.installed {
            let error_details = std::fs::read_to_string(&log_path)
                .unwrap_or_else(|_| "No log file found".to_string());
            return Err(format!(
                "Service installation failed. Details:\n{}",
                error_details
            ));
        }

        info!("Service installed successfully");
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = app;
        Err("Windows Service is only supported on Windows".to_string())
    }
}

/// Uninstall the Windows Service (requires elevation)
#[tauri::command]
pub async fn uninstall_service() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::env;

        let temp_dir = env::temp_dir();
        let log_path = temp_dir.join("zerobyte_service_uninstall.log");
        let _ = std::fs::remove_file(&log_path);

        let script = format!(
            r#"@echo off
echo Stopping service... > "{log}"
sc stop C3iBackupONE >> "{log}" 2>&1
timeout /t 3 /nobreak >nul
echo Deleting service... >> "{log}"
sc delete C3iBackupONE >> "{log}" 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to delete service >> "{log}"
    exit /b %errorlevel%
)
echo Uninstallation complete >> "{log}"
"#,
            log = log_path.display()
        );

        execute_elevated_script(
            "zerobyte_uninstall_service.bat",
            script,
            &log_path,
            "Uninstallation complete",
        )
        .await?;

        let status = get_service_status().await?;

        if status.installed {
            let error_details = std::fs::read_to_string(&log_path)
                .unwrap_or_else(|_| "No log file found".to_string());
            return Err(format!(
                "Service uninstallation failed. Details:\n{}",
                error_details
            ));
        }

        info!("Service uninstalled successfully");
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Windows Service is only supported on Windows".to_string())
    }
}

/// Start the Windows Service (requires elevation)
#[tauri::command]
pub async fn start_service() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::env;

        let temp_dir = env::temp_dir();
        let log_path = temp_dir.join("zerobyte_service_start.log");
        let _ = std::fs::remove_file(&log_path);

        let script = format!(
            r#"@echo off
echo Starting service... > "{log}"
sc start C3iBackupONE >> "{log}" 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to start service >> "{log}"
    exit /b %errorlevel%
)
echo Service started >> "{log}"
"#,
            log = log_path.display()
        );

        execute_elevated_script(
            "zerobyte_start_service.bat",
            script,
            &log_path,
            "Service started",
        )
        .await?;

        let status = get_service_status().await?;

        if !status.running {
            let error_details = std::fs::read_to_string(&log_path)
                .unwrap_or_else(|_| "No log file found".to_string());
            return Err(format!(
                "Failed to start service. Details:\n{}",
                error_details
            ));
        }

        info!("Service started successfully");
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Windows Service is only supported on Windows".to_string())
    }
}

/// Stop the Windows Service (requires elevation)
#[tauri::command]
pub async fn stop_service() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::env;

        let temp_dir = env::temp_dir();
        let log_path = temp_dir.join("zerobyte_service_stop.log");
        let _ = std::fs::remove_file(&log_path);

        let script = format!(
            r#"@echo off
echo Stopping service... > "{log}"
sc stop C3iBackupONE >> "{log}" 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to stop service >> "{log}"
    exit /b %errorlevel%
)
echo Service stopped >> "{log}"
"#,
            log = log_path.display()
        );

        execute_elevated_script(
            "zerobyte_stop_service.bat",
            script,
            &log_path,
            "Service stopped",
        )
        .await?;

        let status = get_service_status().await?;

        if status.running {
            let error_details = std::fs::read_to_string(&log_path)
                .unwrap_or_else(|_| "No log file found".to_string());
            return Err(format!(
                "Failed to stop service. Details:\n{}",
                error_details
            ));
        }

        info!("Service stopped successfully");
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Windows Service is only supported on Windows".to_string())
    }
}

/// Run a command with UAC elevation using ShellExecuteW
#[cfg(target_os = "windows")]
fn run_elevated(command: &str) -> Result<(), String> {
    use std::ffi::OsStr;
    use std::iter::once;
    use std::os::windows::ffi::OsStrExt;

    use windows::core::PCWSTR;
    use windows::Win32::UI::Shell::ShellExecuteW;
    use windows::Win32::UI::WindowsAndMessaging::SW_HIDE;

    fn to_wide(s: &str) -> Vec<u16> {
        OsStr::new(s).encode_wide().chain(once(0)).collect()
    }

    let operation = to_wide("runas");
    let file = to_wide("cmd.exe");
    let parameters = to_wide(&format!("/c \"{}\"", command));

    unsafe {
        let result = ShellExecuteW(
            None,
            PCWSTR(operation.as_ptr()),
            PCWSTR(file.as_ptr()),
            PCWSTR(parameters.as_ptr()),
            PCWSTR::null(),
            SW_HIDE,
        );

        // ShellExecuteW returns a value > 32 on success
        if result.0 as usize > 32 {
            Ok(())
        } else {
            Err(format!(
                "Failed to execute elevated command. Error code: {}",
                result.0 as usize
            ))
        }
    }
}
