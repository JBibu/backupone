pub mod service;

use crate::AppState;

/// Get the URL of the backend server
/// Returns the service URL if connected to service, otherwise the sidecar URL
#[tauri::command]
pub async fn get_backend_url(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let port = if state.using_service { 4097 } else { state.backend_port };
    Ok(format!("http://localhost:{}", port))
}
