import os
import requests
from urllib.parse import urlparse

def setup_local_project():
    """
    Sets up the local project structure and downloads necessary CSS and JS files
    for the interactive Linux terminal tutorial.
    """
    base_dir = os.getcwd() # Get the current working directory
    css_dir = os.path.join(base_dir, 'css')
    js_dir = os.path.join(base_dir, 'js')

    # Define files to download and their local paths
    files_to_download = {
        'https://cdn.tailwindcss.com': os.path.join(css_dir, 'tailwind.min.css'),
        'https://unpkg.com/xterm@5.3.0/css/xterm.css': os.path.join(css_dir, 'xterm.css'),
        'https://unpkg.com/xterm@5.3.0/lib/xterm.js': os.path.join(js_dir, 'xterm.js'),
        'https://unpkg.com/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js': os.path.join(js_dir, 'xterm-addon-fit.js')
    }

    # Create directories if they don't exist
    print(f"Creating directory: {css_dir}")
    os.makedirs(css_dir, exist_ok=True)
    print(f"Creating directory: {js_dir}")
    os.makedirs(js_dir, exist_ok=True)

    # Download files
    for url, local_path in files_to_download.items():
        print(f"Downloading {url} to {local_path}...")
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)

            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Successfully downloaded {os.path.basename(local_path)}")
        except requests.exceptions.RequestException as e:
            print(f"Error downloading {url}: {e}")
        except IOError as e:
            print(f"Error writing file {local_path}: {e}")

    print("\nProject setup complete!")
    print("Remember to update your 'tutorial.html' file to reference these local files:")
    print("  - <link href=\"./css/tailwind.min.css\" rel=\"stylesheet\">")
    print("  - <link rel=\"stylesheet\" href=\"./css/xterm.css\" />")
    print("  - <script src=\"./js/xterm.js\"></script>")
    print("  - <script src=\"./js/xterm-addon-fit.js\"></script>")
    print("\nFor full offline use, consider self-hosting the 'Inter' font or removing its link.")
    print("To run locally, navigate to your project directory in the terminal and run a simple HTTP server:")
    print("  python -m http.server 8000")
    print("Then open http://localhost:8000/tutorial.html in your browser.")

if __name__ == "__main__":
    setup_local_project()
