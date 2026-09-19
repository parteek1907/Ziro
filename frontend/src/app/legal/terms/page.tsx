export const metadata = {
  title: 'Terms of Service | Ziro',
}

export default function TermsOfServicePage() {
  return (
    <article className="max-w-none text-slate-700 leading-relaxed space-y-6 pb-24">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 font-medium mb-12">Last Updated: 19 September 2026</p>

      <p>
        Welcome to Ziro! These terms and conditions outline the rules and regulations for the use of Ziro's Website and Application.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">1. Acceptance of Terms</h2>
      <p>
        By accessing this platform we assume you accept these terms and conditions. Do not continue to use Ziro if you do not agree to take all of the terms and conditions stated on this page.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">2. Financial Services Disclaimer</h2>
      <p>
        Ziro provides a platform for managing personal finances, international remittances, offline vault storage, and consultant matchmaking. <strong>Ziro is a technology provider, not a bank.</strong> Banking services are provided by our regulated partner institutions. Ziro Consultants provide guidance and support and cannot guarantee transaction approval, recover funds, or override financial institutions.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">3. User Accounts & Security</h2>
      <p>
        If you create an account on Ziro, you are responsible for maintaining the security of your account and its associated credentials. You must immediately notify us of any unauthorized uses of your account or any other breaches of security. Ziro will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">4. Acceptable Use</h2>
      <p>
        You agree not to use the platform to:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600">
        <li>Conduct any illegal or unauthorized financial transactions, including money laundering or financing of terrorism.</li>
        <li>Upload or transmit viruses, malware, or any other type of malicious code.</li>
        <li>Attempt to circumvent any security features or KYC/AML verification requirements.</li>
        <li>Harass, abuse, or harm Ziro Consultants or other users of the platform.</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">5. Ziro Consultants Marketplace</h2>
      <p>
        The "Hire a Consultant" feature allows you to book paid sessions with verified financial experts. Ziro acts merely as an intermediary platform connecting users with consultants. Ziro is not responsible for the specific financial advice given by independent consultants, nor any outcomes resulting from their guidance.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">6. Modifications</h2>
      <p>
        Ziro reserves the right to revise these terms of service for its platform at any time without notice. By using this platform you are agreeing to be bound by the then current version of these terms of service.
      </p>
    </article>
  )
}
