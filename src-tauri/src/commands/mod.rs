pub mod service;

use crate::AppState;
use serde::Serialize;
use std::sync::atomic::Ordering;

#[derive(Debug, Clone, Serialize)]
pub struct BackendInfo {
    pub url: String,
    pub port: u16,
    pub using_service: bool,
}

/// Show the main window and bring it to focus.
/// Used when the app starts minimized but the user needs to log in.
#[tauri::command]
pub async fn show_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window not found".to_string())?;

    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

/// Get the URL of the backend server.
/// Returns the service URL if connected to the service, otherwise the sidecar URL.
#[tauri::command]
pub async fn get_backend_url(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let port = state.backend_port.load(Ordering::SeqCst);
    Ok(format!("http://localhost:{}", port))
}

/// Get detailed backend connection info including port, URL, and connection mode.
#[tauri::command]
pub async fn get_backend_info(state: tauri::State<'_, AppState>) -> Result<BackendInfo, String> {
    let port = state.backend_port.load(Ordering::SeqCst);
    let using_service = state.using_service.load(Ordering::SeqCst);
    Ok(BackendInfo {
        url: format!("http://localhost:{}", port),
        port,
        using_service,
    })
}
