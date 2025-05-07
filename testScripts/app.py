import os
import asyncio
from quart import Quart, render_template_string, request, redirect, url_for
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from playwright.async_api import async_playwright
from datetime import datetime

app = Quart(__name__)

# Directories for storing tabs and videos
TAB_DIR = os.path.join("testScripts", "tabs")
VID_DIR = os.path.join("testScripts", "videos")

# Sample list of popular search queries
RECOMMENDED_SEARCHES = [
    "Sweet Child O' Mine - Guns N Roses",
    "Smells Like Teen Spirit - Nirvana",
    "Under the Bridge - Red Hot Chili Peppers",
    "Hotel California - Eagles",
    "Stairway to Heaven - Led Zeppelin",
    "Tears in Heaven - Eric Clapton",
    "Blackbird - Beatles",
    "Wonderwall - Oasis"
]

# Utility Functions

def slugify(text):
    """Convert text to a slug (lowercase and no spaces)."""
    return text.lower().replace(" ", "").replace("-", "").replace("'", "")

def get_available_songs():
    """Get a list of available song tabs."""
    if not os.path.exists(TAB_DIR):
        return []
    songs = []
    for f in os.listdir(TAB_DIR):
        if f.endswith(".html"):
            filepath = os.path.join(TAB_DIR, f)
            mod_time = os.path.getmtime(filepath)
            songs.append((os.path.splitext(f)[0].replace("_", " ").title(), mod_time))
    return sorted(songs, key=lambda x: -x[1])

def extract_tab(song_slug):
    """Extract the tab text from a saved tab file."""
    path = os.path.join(TAB_DIR, song_slug + ".html")
    if not os.path.exists(path):
        return "Tab file not found."
    with open(path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
    pre = soup.find("pre")
    return pre.get_text() if pre else "No <pre> block found."

def get_video_url(slug):
    """Get the video URL for the song from the saved directory."""
    path = os.path.join(VID_DIR, slug + ".txt")
    if os.path.exists(path):
        with open(path, "r") as f:
            return f.read().strip()
    return None

def search_ug_link(song_title, artist_name=""):
    """Search for the Ultimate Guitar tab link for the song."""
    query = f"{song_title} {artist_name} site:ultimate-guitar.com"
    with DDGS() as ddg:
        results = ddg.text(query, max_results=5)
        for r in results:
            if "tabs" in r["href"]:
                return r["href"]
    return None

def search_youtube_link(song_title, artist_name=""):
    """Search for a YouTube video link for the song."""
    query = f"{song_title} {artist_name} site:youtube.com"
    with DDGS() as ddg:
        results = ddg.text(query, max_results=5)
        for r in results:
            if "youtube.com/watch" in r["href"]:
                video_id = r["href"].split("watch?v=")[-1].split("&")[0]
                return f"https://www.youtube.com/embed/{video_id}"
    return None

async def extract_and_save_tab(url, save_path, song_title):
    """Use Playwright to fetch the tab and save it to a file."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=30000)
        await page.wait_for_selector("pre", timeout=30000)
        pre = await page.query_selector("pre")
        tab_text = await pre.inner_text()
        await browser.close()
        with open(save_path, "w", encoding="utf-8") as f:
            f.write(f"<pre>\n{tab_text}\n</pre>")

async def fetch_tab(song_title, artist_name=""):
    """Fetch the tab from Ultimate Guitar and save it."""
    os.makedirs(TAB_DIR, exist_ok=True)
    os.makedirs(VID_DIR, exist_ok=True)
    slug = slugify(song_title)
    tab_url = search_ug_link(song_title, artist_name)
    if not tab_url:
        return False
    tab_path = os.path.join(TAB_DIR, f"{slug}.html")
    if not os.path.exists(tab_path):
        await extract_and_save_tab(tab_url, tab_path, song_title)
    video_url = search_youtube_link(song_title, artist_name)
    if video_url:
        with open(os.path.join(VID_DIR, f"{slug}.txt"), "w") as f:
            f.write(video_url)
    return True

# Routes

@app.route('/')
async def index():
    song_tuples = get_available_songs()
    if not song_tuples:
        return "<h2 style='color:red;'>No tabs found.</h2>"
    songs = [t[0] for t in song_tuples]
    selected_song = request.args.get("song", songs[0])
    slug = slugify(selected_song)
    tab_text = extract_tab(slug)
    video_url = get_video_url(slug)

    return await render_template_string(TEMPLATE, 
        selected_song=selected_song, 
        tab_text=tab_text, 
        songs=songs, 
        video_url=video_url,
        recommended_searches=RECOMMENDED_SEARCHES)

@app.route('/fetch', methods=['POST'])
async def fetch():
    form = await request.form  # Await the form to get the data
    song = form.get("song")  # Get the song title from the form input
    artist = form.get("artist", "")  # Get the artist name (optional)

    if song:
        success = await fetch_tab(song, artist)  # Pass both song title and artist name to fetch_tab
        if success:
            return redirect(url_for("index", song=song.title()))  # Redirect back to the main page with the song selected
    return "<h3 style='color:red;'>❌ Could not find tab.</h3>"

TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <title>Tab Viewer</title>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    body { background: var(--bg); color: var(--fg); font-family:'JetBrains Mono', monospace; }
    :root { --bg: #0f0f0f; --fg: #e0ffe0; }
    body.light { --bg: #fff; --fg: #000; }
    .container { max-width: 1000px; margin: auto; padding: 2rem; }
    pre { white-space: pre-wrap; font-size: 1rem; }
    select, input, button {
      font-family: 'JetBrains Mono'; padding: 0.5rem; margin: 0.25rem;
      border-radius: 5px; border: 1px solid #00ffc3;
    }
    .fretboard { margin: 2rem auto; max-width: 800px; text-align: center; color: #0ff; font-family: monospace; }
  </style>
</head>
<body>
  <div class='container'>
    <form method='get'>
      <select name='song' onchange='this.form.submit()'>
        {% for title in songs %}<option value='{{ title }}' {% if title == selected_song %}selected{% endif %}>{{ title }}</option>{% endfor %}
      </select>
    </form>
    <form method='post' action='/fetch'>
      <input type='text' name='song' id='songInput' placeholder='New song title' required>
      <input type='text' name='artist' placeholder='Artist (optional)'>
      <button type='submit'>Fetch Tab</button>
      <select id='recommendedDropdown'>
        <option value=''>Popular searches:</option>
        {% for item in recommended_searches %}<option value="{{ item }}">{{ item }}</option>{% endfor %}
      </select>
    </form>
    <h1>{{ selected_song }}</h1>
    <pre id='tab'>{{ tab_text }}</pre>
    <div class='fretboard'>
      <pre>
E |--0--1--2--3--4--5--6--7--8--9--10--11--12
B |--0--1--2--3--4--5--6--7--8--9--10--11--12
G |--0--1--2--3--4--5--6--7--8--9--10--11--12
D |--0--1--2--3--4--5--6--7--8--9--10--11--12
A |--0--1--2--3--4--5--6--7--8--9--10--11--12
E |--0--1--2--3--4--5--6--7--8--9--10--11--12
      </pre>
    </div>
  </div>
</body>
</html>"""

if __name__ == '__main__':
    os.makedirs(TAB_DIR, exist_ok=True)
    os.makedirs(VID_DIR, exist_ok=True)
    app.run(debug=True, use_reloader=False)
