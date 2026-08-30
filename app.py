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

RECEIVER_EMAIL = "iuzunov90@gmail.com"


# =========================================================
# IMAGE UPLOAD SETTINGS
# =========================================================

# Maximum allowed size for a single uploaded image - 5 MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024


# Allowed image MIME types
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}


# =========================================================
# HOME PAGE
# =========================================================

@app.route('/')
def home():
    return render_template('index.html')


# =========================================================
# TERMS & PRIVACY PAGES
# =========================================================

@app.route('/terms')
def terms():
    return render_template('terms.html')


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')


# =========================================================
# ROBOTS.TXT
# =========================================================

@app.route('/robots.txt')
def robots():
    return app.send_static_file('robots.txt')


# =========================================================
# SITEMAP.XML
# =========================================================

@app.route('/sitemap.xml')
def sitemap():
    return app.send_static_file('sitemap.xml')


# =========================================================
# QUOTE FORM SUBMISSION
# =========================================================

@app.route('/send-quote', methods=['POST'])
def send_quote():

    # -----------------------------------------------------
    # GET TEXT FORM FIELDS
    # -----------------------------------------------------

    name = request.form.get('name', '').strip()
    phone = request.form.get('phone', '').strip()
    email = request.form.get('email', '').strip()
    service = request.form.get('type', '').strip()
    budget = request.form.get('budget', '').strip()
    message = request.form.get('message', '').strip()


    # -----------------------------------------------------
    # VALIDATE REQUIRED FIELDS
    # -----------------------------------------------------

    if not name or not phone or not email or not service or not message:
        return "Моля, попълнете всички задължителни полета.", 400


    # -----------------------------------------------------
    # GET UPLOADED IMAGES
    # -----------------------------------------------------

    images = request.files.getlist('images')


    # -----------------------------------------------------
    # VALIDATE UPLOADED IMAGES
    # -----------------------------------------------------

    valid_images = []

    for image in images:

        # Skip empty file fields
        if not image or not image.filename:
            continue


        # Check whether the uploaded file type is allowed
        if image.mimetype not in ALLOWED_IMAGE_TYPES:
            return (
                "Невалиден формат на снимката. "
                "Позволени са JPG, PNG и WEBP.",
                400
            )


        # Read the uploaded file into memory
        file_data = image.read()


        # Check the uploaded file size
        if len(file_data) > MAX_IMAGE_SIZE:
            return (
                f"Снимката '{image.filename}' е по-голяма от 5 MB.",
                400
            )


        # Store the validated image information
        valid_images.append(
            (
                image.filename,
                image.mimetype,
                file_data
            )
        )


    # -----------------------------------------------------
    # CHECK EMAIL PASSWORD CONFIGURATION
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
    mail["From"] = GMAIL_ADDRESS
    mail["To"] = RECEIVER_EMAIL
    mail["Reply-To"] = email


    # -----------------------------------------------------
    # SET EMAIL CONTENT
    # -----------------------------------------------------

    mail.set_content(
        f"""
НОВО ЗАПИТВАНЕ ОТ САЙТА
=======================

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
    # ATTACH UPLOADED IMAGES
    # -----------------------------------------------------

    for filename, mimetype, file_data in valid_images:

        maintype, subtype = mimetype.split('/', 1)

        mail.add_attachment(
            file_data,
            maintype=maintype,
            subtype=subtype,
            filename=filename
        )


    # -----------------------------------------------------
    # SEND EMAIL THROUGH GMAIL SMTP
    # -----------------------------------------------------

    try:

        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:

            # Establish a secure TLS connection
            smtp.starttls()


            # Log in using the Gmail address and App Password
            smtp.login(
                GMAIL_ADDRESS,
                GMAIL_APP_PASSWORD
            )


            # Send the email
            smtp.send_message(mail)


        # Return success message to the user
        return """
        <h2>Запитването беше изпратено успешно!</h2>
        <p>Благодарим Ви. Ще се свържем с Вас възможно най-скоро.</p>
        <a href="/">Обратно към сайта</a>
        """


    except Exception as error:

        # Print the error to the server console
        print("EMAIL ERROR:", error)


        # Return an error message to the user
        return """
        <h2>Възникна проблем при изпращането.</h2>
        <p>Моля, опитайте отново по-късно.</p>
        <a href="/">Обратно към сайта</a>
        """, 500


# =========================================================
# APPLICATION START
# =========================================================

if __name__ == '__main__':
    app.run(debug=True)