import os
import asyncio
from duckduckgo_search import DDGS
from playwright.async_api import async_playwright

TAB_DIR = os.path.join("testScripts", "tabs")

def slugify(text):
    return text.lower().replace(" ", "").replace("-", "").replace("'", "")

def search_ug_link(song_title, artist_name=""):
    query = f"{song_title} {artist_name} site:ultimate-guitar.com"
    with DDGS() as ddg:
        results = ddg.text(query, max_results=5)
        for r in results:
            if "tabs" in r["href"]:
                return r["href"]
    return None

async def download_tab_html(url, save_path):
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=100000)
            await page.wait_for_selector("pre", timeout=100000)
            html = await page.content()
            await browser.close()

            with open(save_path, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"✅ Saved tab to {save_path}")
    except Exception as e:
        print("❌ Error downloading tab:", e)

def fetch_tab(song_title, artist_name=""):
    os.makedirs(TAB_DIR, exist_ok=True)
    link = search_ug_link(song_title, artist_name)
    if not link:
        print("❌ Could not find a tab link.")
        return

    slug = slugify(song_title)
    save_path = os.path.join(TAB_DIR, f"{slug}.html")
    asyncio.run(download_tab_html(link, save_path))

# === Run it ===
if __name__ == "__main__":
    song = input("Song Title: ")
    artist = input("Artist Name (optional): ")
    fetch_tab(song, artist)
