
from flask import Flask, request, render_template_string

app = Flask(__name__)

template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Guitar Tab Viewer</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; }}
        iframe {{ border: none; width: 100%; height: 600px; margin-top: 20px; }}
    </style>
</head>
<body>
    <h2>Songsterr Tab Viewer</h2>
    <form method="get">
        <label>Artist: <input type="text" name="artist" required></label><br>
        <label>Song Title: <input type="text" name="title" required></label><br>
        <label>Song ID: <input type="number" name="id" required></label><br>
        <button type="submit">View Tab</button>
    </form>

    {{% if embed_url %}}
    <iframe src="{{{{ embed_url }}}}" allowfullscreen></iframe>
    {{% endif %}}
</body>
</html>
"""

@app.route("/", methods=["GET"])
def index():
    artist = request.args.get("artist", "")
    title = request.args.get("title", "")
    song_id = request.args.get("id", "")
    embed_url = ""

    if artist and title and song_id:
        safe_artist = artist.strip().lower().replace(" ", "-")
        safe_title = title.strip().lower().replace(" ", "-")
        embed_url = f"https://www.songsterr.com/a/wsa/{safe_artist}-{safe_title}-tab-s{song_id}t0"

    return render_template_string(template, embed_url=embed_url)

if __name__ == "__main__":
    app.run(debug=True)
