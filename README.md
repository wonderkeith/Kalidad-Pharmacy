# Kalidad Pharmacy Careers Application Backend

## Deploy to Vercel

1. Copy your full website files into this folder, replacing/adding the other HTML pages and assets.
2. Push the repository to GitHub.
3. Import the GitHub repository into Vercel.
4. In Vercel Project Settings → Environment Variables, add:
   - RESEND_API_KEY
   - APPLICATION_EMAIL = kalidadpharmacy@gmail.com
   - FROM_EMAIL = a sender address verified in Resend
5. Redeploy.

The careers.html form posts to `/api/applications`.
The Vercel Function emails the application details and attaches the uploaded CV.
After a successful response, the thank-you page is displayed.
