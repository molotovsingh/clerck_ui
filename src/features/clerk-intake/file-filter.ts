const REJECTED_EXTENSIONS = new Set([
  ".ds_store", ".thumbs.db", ".desktop.ini", ".spotlight-v100",
  ".trashes", ".fseventsd", ".volumeicon.icns",
  ".exe", ".msi", ".bat", ".cmd", ".com", ".scr", ".pif",
  ".app", ".dmg", ".pkg", ".deb", ".rpm",
  ".sh", ".bash", ".csh", ".ps1", ".vbs", ".wsf",
  ".dll", ".so", ".dylib", ".sys", ".drv", ".o", ".obj",
  ".class", ".pyc", ".pyo", ".wasm",
  ".iso", ".img", ".vmdk", ".ova",
  ".tmp", ".temp", ".swp", ".swo", ".lock",
]);

const REJECTED_PREFIXES = [".", "~", "__MACOSX"];

export function filterFiles(files: File[]): { accepted: File[]; rejected: File[] } {
  const accepted: File[] = [];
  const rejected: File[] = [];
  for (const file of files) {
    const name = file.name.toLowerCase();
    const ext = name.includes(".") ? "." + name.split(".").pop()! : "";
    const isJunk =
      REJECTED_EXTENSIONS.has(ext) ||
      REJECTED_EXTENSIONS.has(name) ||
      REJECTED_PREFIXES.some((p) => name.startsWith(p.toLowerCase())) ||
      file.size === 0;
    if (isJunk) rejected.push(file);
    else accepted.push(file);
  }
  return { accepted, rejected };
}
