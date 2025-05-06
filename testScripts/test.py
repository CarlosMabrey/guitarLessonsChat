import requests

def find_songsterr_id(song_title):
    try:
        query = song_title.strip().replace(" ", "+")
        url = f"https://www.songsterr.com/a/ra/songs.json?pattern={query}"
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=5)

        if response.status_code != 200:
            return None, f"HTTP error: {response.status_code}"

        results = response.json()
        if not results:
            return None, "No results found."

        result = results[0]
        song_id = result["id"]
        title = result["title"]
        artist = result["artist"]["name"]

        url = f"https://www.songsterr.com/a/wsa/{artist.lower().replace(' ', '-')}-{title.lower().replace(' ', '-')}-tab-s{song_id}t0"
        return {
            "id": song_id,
            "title": title,
            "artist": artist,
            "url": url
        }, None

    except requests.exceptions.RequestException as e:
        return None, f"Network error: {e}"
    except Exception as e:
        return None, f"Unexpected error: {e}"

# Try it
song_info, error = find_songsterr_id("House of the Rising Sun")

if song_info:
    print(f"✅ Found: {song_info['title']} by {song_info['artist']}")
    print(f"🔗 Tab URL: {song_info['url']}")
else:
    print(f"❌ Error: {error}")
