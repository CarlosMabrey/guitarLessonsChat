
from flask import Flask, request, render_template_string
import requests

app = Flask(__name__)

template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Auto-Find Guitar Tabs</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; }}
        iframe {{ border: none; width: 100%; height: 600px; margin-top: 20px; }}
    </style>
</head>
<body>
    <h2>Songsterr Tab Finder</h2>
    <form method="get">
        <label>Search Song: <input type="text" name="query" required></label><br>
        <button type="submit">Find Tab</button>
    </form>

    {{% if embed_url %}}
        <h3>Showing results for: {{{{ match_title }}}} by {{{{ match_artist }}}}</h3>
        <iframe src="{{{{ embed_url }}}}" allowfullscreen></iframe>
    {{% elif error %}}
        <p style="color: red;">{{{{ error }}}}</p>
    {{% endif %}}
</body>
</html>
"""

@app.route("/", methods=["GET"])
def index():
    query = request.args.get("query", "")
    embed_url = match_title = match_artist = error = None

    if query:
        api_url = f"https://www.songsterr.com/a/ra/songs.json?pattern={query}"
        try:
            res = requests.get(api_url)
            data = res.json()
            if data:
                first_result = data[0]
                song_id = first_result["id"]
                match_title = first_result["title"]
                match_artist = first_result["artist"]["name"]
                safe_artist = match_artist.strip().lower().replace(" ", "-")
                safe_title = match_title.strip().lower().replace(" ", "-")
                embed_url = f"https://www.songsterr.com/a/wsa/{safe_artist}-{safe_title}-tab-s{song_id}t0"
            else:
                error = "No tab found for that song."
        except Exception as e:
            error = f"Error searching Songsterr: {str(e)}"

    return render_template_string(template, embed_url=embed_url, match_title=match_title, match_artist=match_artist, error=error)

if __name__ == "__main__":
    app.run(debug=True)
