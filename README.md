# SLAY — Telegram Mini App

Standalone static hosting bundle, with no ChatGPT authentication or hosting dependency.

Deploy dist/ as a public HTTPS static site. render.yaml describes a Render static site.
No bot token or participant records are included. The Telegram SDK is loaded from telegram.org.

After deployment, update the existing Telegram bot's settings.miniapp_url to the exact new HTTPS URL.
Use the bot's reply keyboard web_app launch: Telegram.WebApp.sendData requires this launch mode.
Do not replace it with a menu launch without implementing another authenticated submission endpoint.
Keep the existing bot process running; it validates service messages and forwards results to its configured owner.
Verify the new URL inside Telegram from Belarus before retiring the original hosted page.
