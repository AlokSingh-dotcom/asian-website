from flask import Flask, abort, jsonify, request, send_file, Response
from pathlib import Path

app = Flask(__name__)

# Static folder location for this specific HTML bundle
BASE_DIR = Path(__file__).resolve().parent
BUNDLE_DIR = BASE_DIR / "outputs" / "iq200-metal-lab"


def _read_text(path: Path, content_type: str) -> Response:
    if not path.exists():
        abort(404)
    return Response(path.read_text(encoding="utf-8"), status=200, content_type=content_type)


def _asset_type(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".png":
        return "image/png"
    if suffix == ".svg":
        return "image/svg+xml; charset=utf-8"
    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"
    if suffix == ".webp":
        return "image/webp"
    return "application/octet-stream"


@app.route("/", methods=["GET"])
@app.route("/index.html", methods=["GET"])
def index():
    return _read_text(BUNDLE_DIR / "index.html", "text/html; charset=utf-8")


@app.route("/career", methods=["GET"])
@app.route("/career.html", methods=["GET"])
def career():
    return _read_text(BUNDLE_DIR / "career.html", "text/html; charset=utf-8")


@app.route("/certifications", methods=["GET"])
@app.route("/certifications.html", methods=["GET"])
def certifications():
    return _read_text(BUNDLE_DIR / "certifications.html", "text/html; charset=utf-8")


# Serve bundle root assets
@app.route("/styles.css", methods=["GET"])
def styles():
    return _read_text(BUNDLE_DIR / "styles.css", "text/css; charset=utf-8")


@app.route("/script.js", methods=["GET"])
def script():
    return _read_text(BUNDLE_DIR / "script.js", "application/javascript; charset=utf-8")


@app.route("/assets/<path:requested_path>", methods=["GET"])
def assets(requested_path: str):
    requested_path = requested_path.replace("..", "")
    target = BUNDLE_DIR / "assets" / requested_path
    if not target.exists() or not target.is_file():
        abort(404)
    return send_file(target, mimetype=_asset_type(target))


@app.route("/api/quote", methods=["POST"])
def quote_request():
    data = request.get_json(silent=True) or request.form.to_dict()
    required = ["name", "email", "phone", "service", "message"]
    missing = [field for field in required if not str(data.get(field, "")).strip()]
    if missing:
        return jsonify({"ok": False, "message": "Please complete all required fields."}), 400
    if "@" not in data.get("email", ""):
        return jsonify({"ok": False, "message": "Please enter a valid email address."}), 400
    return jsonify({
        "ok": True,
        "message": "Quote request received. Our team will contact you shortly."
    })


@app.route("/api/newsletter", methods=["POST"])
def newsletter():
    data = request.get_json(silent=True) or request.form.to_dict()
    email = str(data.get("email", "")).strip()
    if "@" not in email:
        return jsonify({"ok": False, "message": "Please enter a valid work email."}), 400
    return jsonify({"ok": True, "message": "Subscribed successfully."})


@app.route("/brochure", methods=["GET"])
def brochure():
    return Response(
        "Asian Testing and Inspection Services brochure placeholder. Replace this route with a final PDF when ready.",
        status=200,
        content_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=atis-brochure.txt"},
    )


# Serve service pages and their assets (HTML/CSS/JS)
@app.route("/services/<path:requested_path>", methods=["GET"])
def services(requested_path: str):
    # Prevent path traversal outside BUNDLE_DIR
    requested_path = requested_path.replace("..", "")
    target = BUNDLE_DIR / "services" / requested_path

    suffix = Path(requested_path).suffix.lower()
    if suffix == ".html":
        return _read_text(target, "text/html; charset=utf-8")
    if suffix == ".css":
        return _read_text(target, "text/css; charset=utf-8")
    if suffix == ".js":
        return _read_text(target, "application/javascript; charset=utf-8")

    abort(404)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


