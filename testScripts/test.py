import streamlit as st
import requests
from bs4 import BeautifulSoup
import urllib.parse
import json

st.set_page_config(page_title="Guitar Tab Finder", layout="centered")
st.title("🎸 Guitar Tab Finder")

# --- Example Songs ---
st.sidebar.title("🎵 Example Songs")
examples = {
    "Sweet Child O' Mine - Guns N' Roses": ("Sweet Child O' Mine", "Guns N' Roses"),
    "Wonderwall - Oasis": ("Wonderwall", "Oasis"),
    "Smells Like Teen Spirit - Nirvana": ("Smells Like Teen Spirit", "Nirvana"),
    "Hotel California - Eagles": ("Hotel California", "Eagles")
}
selected_example = st.sidebar.selectbox("Try an example:", ["" ] + list(examples.keys()))

if selected_example:
    song, artist = examples[selected_example]
else:
    st.subheader("Search for a Song")
    song = st.text_input("Song Title", placeholder="e.g. Screaming")
    artist = st.text_input("Artist", placeholder="e.g. Loathe")

# --- Ultimate Guitar direct page clone (specific example) ---
def get_static_ug_tab():
    url = "https://tabs.ultimate-guitar.com/tab/nirvana/smells-like-teen-spirit-tabs-202727"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        scripts = soup.find_all("script")
        for script in scripts:
            if "window.UGAPP.store.page" in script.text:
                json_text = script.text.split("=", 1)[-1].strip().rstrip(";")
                parsed = json.loads(json_text)
                content = parsed["data"]["tab_view"].get("wiki_tab", {}).get("content") or parsed["data"]["tab_view"].get("content")
                return url, content
    except Exception as e:
        print(f"UG example scrape error: {e}")
    return None, None

# --- General web tab scraper ---
def scrape_public_tab_text(song_title, artist=None):
    query = f"{song_title} guitar tab"
    if artist:
        query += f" {artist}"

    encoded_query = urllib.parse.quote_plus(query)
    search_url = f"https://duckduckgo.com/html/?q={encoded_query}"
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        for link in soup.find_all("a", href=True):
            href = link["href"]
            if href.startswith("//"):
                href = "https:" + href
            if any(domain in href for domain in ["911tabs.com", "guitartabs.cc", "azchords.com"]):
                page = requests.get(href, headers=headers, timeout=10)
                tab_page = BeautifulSoup(page.text, "html.parser")
                pre_tags = tab_page.find_all("pre")
                if pre_tags:
                    return href, pre_tags[0].text.strip()
        return None, None
    except Exception as e:
        print(f"Error scraping public tab: {e}")
        return None, None

# --- Dummy fallback for demo tab ---
def get_ultimate_guitar_tab_text(song_title, artist):
    if song_title.lower() == "smells like teen spirit" and artist.lower() == "nirvana":
        return get_static_ug_tab()
    return None, None

def get_songsterr_tab_url(song_title, artist=None):
    query = f"site:songsterr.com {song_title}"
    if artist:
        query += f" {artist}"
    headers = {"User-Agent": "Mozilla/5.0"}
    search_url = f"https://duckduckgo.com/html/?q={urllib.parse.quote_plus(query)}"
    try:
        response = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        for link in soup.find_all("a", href=True):
            href = link["href"]
            if "songsterr.com" in href:
                return href
    except Exception as e:
        print(f"Songsterr error: {e}")
    return None

def get_youtube_tutorial_links(song_title, artist=None):
    query = f"{song_title} guitar tutorial"
    if artist:
        query += f" {artist}"

    headers = {"User-Agent": "Mozilla/5.0"}
    search_url = f"https://duckduckgo.com/html/?q={urllib.parse.quote_plus(query)} site:youtube.com"
    try:
        response = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        links = []
        for link in soup.find_all("a", href=True):
            href = link["href"]
            if "youtube.com" in href and "watch?v=" in href:
                if href.startswith("//"):
                    href = "https:" + href
                links.append(href)
            if len(links) >= 3:
                break
        return links
    except Exception as e:
        print(f"YouTube error: {e}")
        return []

# --- Show Result ---
if st.button("Search") and song:
    tab_url, tab_text = get_ultimate_guitar_tab_text(song, artist)
    if tab_url:
        st.success("Tab Found on Ultimate Guitar!")
        st.markdown(f"[Open on Ultimate Guitar]({tab_url})")
        if tab_text:
            st.code(tab_text, language="text")
        else:
            st.warning("Could not extract tab content, view on site.")
    else:
        st.info("Trying fallback to Songsterr...")
        fallback_url = get_songsterr_tab_url(song, artist)
        if fallback_url:
            st.success("Tab Found on Songsterr!")
            st.markdown(f"[Open on Songsterr]({fallback_url})")
            st.components.v1.iframe(src=fallback_url, height=500)
        else:
            st.info("Trying other public sources...")
            alt_url, alt_tab = scrape_public_tab_text(song, artist)
            if alt_url:
                st.success("Found a tab from public archive!")
                st.markdown(f"[Open Source]({alt_url})")
                st.code(alt_tab, language="text")
            else:
                st.warning("Could not find tab content. Showing YouTube tutorials instead...")

    st.divider()
    st.subheader("🎥 YouTube Tutorials")
    youtube_links = get_youtube_tutorial_links(song, artist)
    if youtube_links:
        for url in youtube_links:
            video_id = url.split("v=")[-1].split("&")[0]
            embed_url = f"https://www.youtube.com/embed/{video_id}"
            st.video(embed_url)
    else:
        st.write("No YouTube tutorials found.")
