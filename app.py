from flask import Flask, render_template, request
import smtplib
import os
from email.message import EmailMessage

app = Flask(__name__)

# =========================================================
# EMAIL SETTINGS
# =========================================================

GMAIL_ADDRESS = "iuzunov90@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")

RECEIVER_EMAIL = "sgm_pro@abv.bg"

# =========================================================
# IMAGE UPLOAD SETTINGS
# =========================================================

MAX_IMAGE_SIZE = 5 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
"image/jpeg",
"image/png",
"image/webp"
}

# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")

# =========================================================
# TERMS & PRIVACY PAGES
# =========================================================

@app.route("/terms")
def terms():
    return render_template("terms.html")

@app.route("/privacy")
def privacy():
    return render_template("privacy.html")

# =========================================================
# ROBOTS.TXT
# =========================================================

@app.route("/robots.txt")
def robots():
    return app.send_static_file("robots.txt")

# =========================================================
# SITEMAP.XML
# =========================================================

@app.route("/sitemap.xml")
def sitemap():
    return app.send_static_file("sitemap.xml")

# =========================================================
# QUOTE FORM SUBMISSION
# =========================================================

@app.route("/send-quote", methods=["POST"])
def send_quote():

    # -----------------------------------------------------
    # GET FORM DATA
    # -----------------------------------------------------

    name = request.form.get("name", "").strip()
    phone = request.form.get("phone", "").strip()
    email = request.form.get("email", "").strip()
    service = request.form.get("type", "").strip()
    budget = request.form.get("budget", "").strip()
    message = request.form.get("message", "").strip()


    # -----------------------------------------------------
    # VALIDATE REQUIRED FIELDS
    # -----------------------------------------------------

    if not name or not phone or not email or not service or not message:
        return "Моля, попълнете всички задължителни полета.", 400


    # -----------------------------------------------------
    # GET UPLOADED IMAGES
    # -----------------------------------------------------

    images = request.files.getlist("images")

    valid_images = []

    # -----------------------------------------------------
    # VALIDATE IMAGES
    # -----------------------------------------------------

    for image in images:
        if not image or not image.filename:
            continue

        if image.mimetype not in ALLOWED_IMAGE_TYPES:
            return (
                "Невалиден формат на снимката. "
                "Позволени са JPG, PNG и WEBP.",
                400
            )

        file_data = image.read()

        if len(file_data) > MAX_IMAGE_SIZE:
            return (
                f"Снимката '{image.filename}' е по-голяма от 5 MB.",
                400
            )

        valid_images.append(
            (
                image.filename,
                image.mimetype,
                file_data
            )
        )

    # -----------------------------------------------------
    # CHECK GMAIL PASSWORD
    # -----------------------------------------------------

    if not GMAIL_APP_PASSWORD:

        print("EMAIL ERROR: GMAIL_APP_PASSWORD is not configured.")

        return """

<h2>Възникна проблем при изпращането.</h2>
<p>Моля, опитайте отново по-късно.</p>
<a href="/">Обратно към сайта</a>
""", 500

    # -----------------------------------------------------
    # CREATE EMAIL
    # -----------------------------------------------------

    mail = EmailMessage()

    mail["Subject"] = f"Ново запитване от {name}"

    mail["From"] = f"sgmpro.bg<{GMAIL_ADDRESS}>"

    mail["To"] = RECEIVER_EMAIL

    mail["Reply-To"] = email


    # -----------------------------------------------------
    # EMAIL CONTENT
    # -----------------------------------------------------

    mail.set_content(
        f"""
```

# НОВО ЗАПИТВАНЕ ОТ САЙТА

Име и фамилия:
{name}

Телефон:
{phone}

Имейл:
{email}

Вид услуга:
{service}

Ориентировъчен бюджет:
{budget if budget else "Не е посочен"}

Описание на проекта:
{message}

Брой прикачени снимки:
{len(valid_images)}
"""
)

    # -----------------------------------------------------
    # ATTACH IMAGES
    # -----------------------------------------------------

    for filename, mimetype, file_data in valid_images:

        maintype, subtype = mimetype.split("/", 1)

        mail.add_attachment(
            file_data,
            maintype=maintype,
            subtype=subtype,
            filename=filename
        )


    # -----------------------------------------------------
    # SEND EMAIL
    # -----------------------------------------------------

    try:

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:

            smtp.starttls()

            smtp.login(
                GMAIL_ADDRESS,
                GMAIL_APP_PASSWORD
            )

            smtp.send_message(mail)


        return """
    
        <h2>Запитването беше изпратено успешно!</h2>
        <p>Благодарим Ви. Ще се свържем с Вас възможно най-скоро.</p>
        <a href="/">Обратно към сайта</a>
        """

    except Exception as error:

        print("EMAIL ERROR:", error)

        return """

        <h2>Възникна проблем при изпращането.</h2>
        <p>Моля, опитайте отново по-късно.</p>
        <a href="/">Обратно към сайта</a>
        """, 500

# =========================================================

# APPLICATION START

# =========================================================

if __name__ == "__main__":
    app.run(debug=False)
