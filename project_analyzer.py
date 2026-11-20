import os
import ast

ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(ROOT, "PROJECT_ANALYSIS.txt")

IGNORE_DIRS = {
    "venv",
    ".venv",
    "__pycache__",
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build"
}

IGNORE_EXTENSIONS = {
    ".pyc",
    ".pyo",
    ".dll",
    ".exe",
    ".bin",
    ".pt",
    ".pth",
    ".onnx",
    ".mp4",
    ".avi",
    ".mov",
    ".zip",
    ".rar"
}

def get_file_size(path):
    try:
        size = os.path.getsize(path)

        if size < 1024:
            return f"{size} B"
        elif size < 1024**2:
            return f"{size / 1024:.2f} KB"
        elif size < 1024**3:
            return f"{size / (1024**2):.2f} MB"
        else:
            return f"{size / (1024**3):.2f} GB"
    except:
        return "Unknown"

def analyze_python_file(path):
    result = {
        "imports": [],
        "classes": [],
        "functions": [],
        "routes": []
    }

    try:
        with open(path, "r", encoding="utf-8") as file:
            content = file.read()

        tree = ast.parse(content)

        for node in ast.walk(tree):

            if isinstance(node, ast.Import):
                for name in node.names:
                    result["imports"].append(name.name)

            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    result["imports"].append(node.module)

            elif isinstance(node, ast.ClassDef):
                result["classes"].append(node.name)

            elif isinstance(node, ast.FunctionDef):
                result["functions"].append(node.name)

                # Detect FastAPI route decorators
                for decorator in node.decorator_list:
                    decorator_text = ast.unparse(decorator)

                    if any(method in decorator_text for method in
                           ["get", "post", "put", "delete", "patch"]):
                        result["routes"].append(
                            f"{decorator_text} -> {node.name}"
                        )

    except Exception as e:
        result["error"] = str(e)

    return result


def main():

    total_files = 0
    python_files = 0
    folders = 0

    with open(OUTPUT_FILE, "w", encoding="utf-8") as report:

        report.write("=" * 80 + "\n")
        report.write("DEEPSHIELD AI - PROJECT ANALYSIS REPORT\n")
        report.write("=" * 80 + "\n\n")

        # Project structure
        report.write("\nPROJECT STRUCTURE\n")
        report.write("-" * 80 + "\n")

        for current_root, dirs, files in os.walk(ROOT):

            dirs[:] = [
                d for d in dirs
                if d not in IGNORE_DIRS
            ]

            relative_path = os.path.relpath(current_root, ROOT)

            level = relative_path.count(os.sep) if relative_path != "." else 0

            indent = "    " * level

            report.write(f"{indent}[DIR] {relative_path}\n")

            folders += len(dirs)

            for filename in files:

                filepath = os.path.join(current_root, filename)

                extension = os.path.splitext(filename)[1].lower()

                if extension in IGNORE_EXTENSIONS:
                    continue

                total_files += 1

                report.write(
                    f"{indent}    {filename} "
                    f"({get_file_size(filepath)})\n"
                )

        # Python code analysis
        report.write("\n\nPYTHON FILE ANALYSIS\n")
        report.write("=" * 80 + "\n")

        for current_root, dirs, files in os.walk(ROOT):

            dirs[:] = [
                d for d in dirs
                if d not in IGNORE_DIRS
            ]

            for filename in files:

                if not filename.endswith(".py"):
                    continue

                filepath = os.path.join(current_root, filename)

                relative_path = os.path.relpath(filepath, ROOT)

                python_files += 1

                analysis = analyze_python_file(filepath)

                report.write(f"\nFILE: {relative_path}\n")
                report.write("-" * 60 + "\n")

                report.write(
                    f"Imports: {', '.join(analysis['imports'])}\n"
                )

                report.write(
                    f"Classes: {', '.join(analysis['classes'])}\n"
                )

                report.write(
                    f"Functions: {', '.join(analysis['functions'])}\n"
                )

                if analysis["routes"]:
                    report.write("API Routes:\n")

                    for route in analysis["routes"]:
                        report.write(f"    {route}\n")

                if "error" in analysis:
                    report.write(f"Analysis error: {analysis['error']}\n")

        # Dependencies
        report.write("\n\nDEPENDENCIES\n")
        report.write("=" * 80 + "\n")

        requirements_path = os.path.join(ROOT, "requirements.txt")

        if os.path.exists(requirements_path):

            with open(requirements_path, "r", encoding="utf-8") as req:
                report.write(req.read())

        else:
            report.write("requirements.txt not found.\n")

        # README
        report.write("\n\nREADME CONTENT\n")
        report.write("=" * 80 + "\n")

        readme_path = os.path.join(ROOT, "README.md")

        if os.path.exists(readme_path):

            with open(readme_path, "r", encoding="utf-8") as readme:
                report.write(readme.read())

        else:
            report.write("README.md not found.\n")

        # Summary
        report.write("\n\nPROJECT STATISTICS\n")
        report.write("=" * 80 + "\n")

        report.write(f"Total files scanned: {total_files}\n")
        report.write(f"Python files: {python_files}\n")

    print("\nAnalysis completed!")
    print(f"Report generated: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()