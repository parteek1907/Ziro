export const metadata = {
  title: 'Cookies Policy | Ziro',
}

export default function CookiesPolicyPage() {
  return (
    <article className="max-w-none text-slate-700 leading-relaxed space-y-6 pb-24">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Cookies Policy</h1>
      <p className="text-sm text-gray-400 font-medium mb-12">Last Updated: 19 September 2026</p>

      <p>
        This Cookies Policy explains what Cookies are and how We use them. You should read this policy so You can understand what type of cookies We use, or the information We collect using Cookies and how that information is used.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">1. What are Cookies?</h2>
      <p>
        Cookies are small files that are placed on Your computer, mobile device, or any other device by a website, containing the details of Your browsing history on that website among its many uses.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">2. How Ziro uses Cookies</h2>
      <p>
        Ziro uses cookies to ensure our platform functions correctly, to securely maintain your authentication session, and to analyze our web traffic. Because we handle financial data and TrustScores, security cookies are strictly necessary to protect your account from cross-site request forgery (CSRF) and other vulnerabilities.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">3. Types of Cookies We Use</h2>
      <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600">
        <li><strong>Strictly Necessary Cookies:</strong> These are required for the operation of the Ziro platform. They include, for example, cookies that enable you to log into secure areas like your Dashboard or the Consultant Booking system.</li>
        <li><strong>Analytical/Performance Cookies:</strong> These allow us to recognize and count the number of visitors and to see how visitors move around our platform. This helps us to improve the way Ziro works, for example, by ensuring that users are finding what they are looking for easily.</li>
        <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our website. This enables us to personalize our content for you, greet you by name, and remember your preferences (e.g., your choice of language or region).</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">4. Managing Cookies</h2>
      <p>
        You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. However, declining strictly necessary cookies will prevent you from accessing your Ziro dashboard and managing your financial accounts.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">5. Contact Us</h2>
      <p>
        If you have any questions about our use of cookies, you can contact us at <a href="mailto:privacy@ziro.com" className="text-blue-600 hover:underline">privacy@ziro.com</a>.
      </p>
    </article>
  )
}
