import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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


@app.route("/<requested_path>", methods=["GET"])
def bundle_root_asset(requested_path: str):
    requested_path = requested_path.replace("..", "")
    target = BUNDLE_DIR / requested_path
    if not target.exists() or not target.is_file():
        abort(404)
    if target.suffix.lower() not in {".png", ".svg", ".jpg", ".jpeg", ".webp"}:
        abort(404)
    return send_file(target, mimetype=_asset_type(target))


@app.route("/assets/<path:requested_path>", methods=["GET"])
def assets(requested_path: str):
    requested_path = requested_path.replace("..", "")
    target = BUNDLE_DIR / "assets" / requested_path
    if not target.exists() or not target.is_file():
        abort(404)
    return send_file(target, mimetype=_asset_type(target))


# ---------------------------------------------------------------------------
# Email configuration — Gmail SMTP
# For production, set these environment variables:
#   GMAIL_USER=58aloksingh58@gmail.com
#   GMAIL_APP_PASSWORD=your-16-char-app-password
# ---------------------------------------------------------------------------
GMAIL_USER = os.environ.get("GMAIL_USER", "58aloksingh58@gmail.com")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "fntgufitxrunfmkg")
QUOTE_RECIPIENT = os.environ.get("QUOTE_RECIPIENT", "58aloksingh58@gmail.com")


def _send_email(subject: str, body: str, recipient: str | None = None) -> None:
    """Send an email via Gmail SMTP using an App Password."""
    if not GMAIL_APP_PASSWORD:
        # No password configured – silently skip (useful in dev)
        return

    recipient = recipient or GMAIL_USER

    msg = MIMEMultipart("alternative")
    msg["From"] = GMAIL_USER
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, recipient, msg.as_string())


@app.route("/api/quote", methods=["POST"])
def quote_request():
    data = request.get_json(silent=True) or request.form.to_dict()
    required = ["name", "email", "phone", "service", "message"]
    missing = [field for field in required if not str(data.get(field, "")).strip()]
    if missing:
        return jsonify({"ok": False, "message": "Please complete all required fields."}), 400
    if "@" not in data.get("email", ""):
        return jsonify({"ok": False, "message": "Please enter a valid email address."}), 400

    name = data["name"].strip()
    email = data["email"].strip()
    phone = data["phone"].strip()
    service = data["service"].strip()
    message = data["message"].strip()

    body = (
        f"New Quote Request\n"
        f"{'=' * 50}\n\n"
        f"Name    : {name}\n"
        f"Email   : {email}\n"
        f"Phone   : {phone}\n"
        f"Service : {service}\n"
        f"Message :\n{message}\n"
    )

    try:
        _send_email(
            subject=f"Quote Request — {name} ({service})",
            body=body,
            recipient=QUOTE_RECIPIENT,
        )
    except Exception as exc:
        app.logger.error("Failed to send quote email: %s", exc)
        return jsonify({
            "ok": False,
            "message": "Could not send right now. Please call or email the lab directly."
        }), 500

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
@app.route("/brochure.pdf", methods=["GET"])
def brochure():
    brochure_path = BUNDLE_DIR / "brochure.pdf"
    if not brochure_path.exists():
        brochure_path = BASE_DIR / "Untitled design_5.pdf"
    if not brochure_path.exists():
        abort(404)
    return send_file(
        brochure_path,
        mimetype="application/pdf",
        download_name="asian-testing-inspection-brochure.pdf",
        as_attachment=False,
    )
@app.route("/nable-certificate", methods=["GET"])
@app.route("/NABL-Certificate", methods=["GET"])
def nabl_certificate():
    nabl_path = BUNDLE_DIR / "NABL Certificate LLP New.pdf"
    if not nabl_path.exists():
        abort(404)
    return send_file(
        nabl_path,
        mimetype="application/pdf",
        as_attachment=False,
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
    if suffix in {".png", ".svg", ".jpg", ".jpeg", ".webp"}:
        if not target.exists() or not target.is_file():
            abort(404)
        return send_file(target, mimetype=_asset_type(target))

    abort(404)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


