import os
import re

# === CONFIG ===
folder_path = os.getcwd()  # You can also hardcode like: "C:/Users/Imanol/Documents/myproject"
output_file = "clean_code_output.txt"
extensions = [".py", ".js", ".java", ".ts", ".cpp", ".cs", ".html", ".css", ".mjs", "json", "tsx"]  # Add more if needed

# === HELPERS ===
def is_code_line(line):
    line = line.strip()
    if not line:
        return False
    if line.startswith("#") or line.startswith("//"):
        return False
    if re.match(r"^\s*/\*.*\*/\s*$", line):  # one-line block comment
        return False
    return True

# === MAIN EXTRACTION ===
with open(output_file, "w") as out:
    for root, dirs, files in os.walk(folder_path):
        # Skip these folders
        if any(excluded in root for excluded in ["node_modules", ".git", "__pycache__"]):
            continue
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                full_path = os.path.join(root, file)
                out.write("\nFull Path: ")
                out.write(full_path)
                out.write("\n")
                try:
                    with open(full_path, "r") as f:
                        for line in f:
                            if is_code_line(line):
                                out.write(line)
                except Exception as e:
                    print("Could not read")
                    print(file)
                    print(e)
