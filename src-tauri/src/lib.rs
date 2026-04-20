use serde::Serialize;
use std::fs;
use std::path::{Component, Path, PathBuf};

const REQUIRED_MAP_FILES: [&str; 5] = ["splat.png", "normals.png", "height.png", "slope.png", "water.png"];

#[derive(Serialize)]
struct MapValidationResult {
  is_valid: bool,
  missing_files: Vec<String>,
}

fn to_path_buf(path: &str) -> Result<PathBuf, String> {
  if path.trim().is_empty() {
    return Err("Path is empty".to_string());
  }
  if path.contains('\0') {
    return Err("Path contains a null byte".to_string());
  }
  Ok(PathBuf::from(path))
}

fn ensure_no_parent_traversal(path: &Path) -> Result<(), String> {
  if path
    .components()
    .any(|component| matches!(component, Component::ParentDir))
  {
    return Err("Path may not contain parent traversal ('..')".to_string());
  }
  Ok(())
}

fn ensure_json_extension(path: &Path) -> Result<(), String> {
  let ext = path
    .extension()
    .and_then(|value| value.to_str())
    .unwrap_or_default()
    .to_ascii_lowercase();
  if ext != "json" {
    return Err("Path must point to a .json file".to_string());
  }
  Ok(())
}

#[tauri::command]
fn save_json_file(path: String, content: String) -> Result<(), String> {
  serde_json::from_str::<serde_json::Value>(&content)
    .map_err(|err| format!("Invalid JSON content: {err}"))?;

  let target = to_path_buf(&path)?;
  ensure_no_parent_traversal(&target)?;
  ensure_json_extension(&target)?;
  if let Some(parent) = target.parent() {
    fs::create_dir_all(parent).map_err(|err| format!("Failed creating parent folder: {err}"))?;
  }

  fs::write(&target, content).map_err(|err| format!("Failed writing file: {err}"))
}

#[tauri::command]
fn load_json_file(path: String) -> Result<String, String> {
  let target = to_path_buf(&path)?;
  ensure_no_parent_traversal(&target)?;
  ensure_json_extension(&target)?;
  fs::read_to_string(&target).map_err(|err| format!("Failed reading file: {err}"))
}

#[tauri::command]
fn validate_map_folder(path: String) -> Result<MapValidationResult, String> {
  let folder = to_path_buf(&path)?;
  ensure_no_parent_traversal(&folder)?;
  if !folder.exists() || !folder.is_dir() {
    return Err("Map folder does not exist or is not a directory".to_string());
  }

  let missing_files = REQUIRED_MAP_FILES
    .iter()
    .filter_map(|name| {
      let candidate = folder.join(name);
      if candidate.is_file() {
        None
      } else {
        Some((*name).to_string())
      }
    })
    .collect::<Vec<_>>();

  Ok(MapValidationResult {
    is_valid: missing_files.is_empty(),
    missing_files,
  })
}

#[tauri::command]
fn pick_map_folder() -> Option<String> {
  rfd::FileDialog::new()
    .pick_folder()
    .map(|path| path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      save_json_file,
      load_json_file,
      validate_map_folder,
      pick_map_folder
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

