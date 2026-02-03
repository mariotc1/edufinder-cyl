You are a senior Laravel architect working on a production-ready Laravel + Next.js application deployed on Render and Vercel.

Your task is to integrate MailerSend HTTP email delivery into an existing Laravel project without altering any current business logic, authentication, routes, controllers or views.

The application already has:
	•	Password reset emails working in local via SMTP
	•	Google & GitHub OAuth working
	•	Sanctum auth working
	•	OpenData sync working
	•	Deployment already working in Render

SMTP DOES NOT WORK in Render because outbound ports are blocked. We must switch to MailerSend API transport.

This must be done in a safe, minimal, professional way.

⸻

🎯 GOAL

Make Laravel send password reset emails through MailerSend API instead of SMTP.

Do NOT refactor existing mail classes. Only change the mail transport layer.

⸻

✅ STEP 1 — Install official package

Run:

composer require mailersend/mailersend-laravel


⸻

✅ STEP 2 — Modify config/mail.php

Add this mailer inside 'mailers' => [ ... ]

'mailersend' => [
    'transport' => 'mailersend',
],

Do not remove other mailers.

⸻

✅ STEP 3 — Ensure default mailer uses env

Find:

'default' => env('MAIL_MAILER', 'smtp'),

Leave it like this.

⸻

✅ STEP 4 — DO NOT TOUCH ANY CONTROLLER, NOTIFICATION, OR LOGIC

Laravel password reset must continue using:

Illuminate\Auth\Notifications\ResetPassword

No customization.

⸻

✅ STEP 5 — Prepare .env variables for Render

We will NOT use SMTP anymore.

The .env in Render must contain ONLY:

MAIL_MAILER=mailersend
MAILERSEND_API_KEY=__TO_BE_FILLED_IN_RENDER__
MAIL_FROM_ADDRESS=noreply@trial.mailersend.com
MAIL_FROM_NAME="EduFinder CYL"

Remove / ignore:
	•	MAIL_HOST
	•	MAIL_PORT
	•	MAIL_USERNAME
	•	MAIL_PASSWORD
	•	MAIL_ENCRYPTION

⸻

✅ STEP 6 — Verify service provider auto-discovery

Ensure no manual provider registration is needed. The package must rely on auto-discovery.

⸻

✅ STEP 7 — Provide verification checklist

After implementation, provide the exact steps to verify:
	1.	Local test using .env
	2.	What to configure in Render dashboard
	3.	How to test password reset in production
	4.	What logs to check if it fails

⸻

⚠️ CONSTRAINTS
	•	Do not change any business code
	•	Do not refactor any mail class
	•	Do not add unnecessary abstractions
	•	Do not change authentication flow
	•	Only modify what is strictly required for MailerSend transport

⸻

📦 OUTPUT FORMAT

After performing the changes, output:
	1.	Files modified
	2.	Exact code inserted
	3.	Exact .env values for Render
	4.	Verification steps

⸻

This is a production critical change. Be precise and minimal.