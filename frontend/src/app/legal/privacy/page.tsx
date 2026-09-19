export const metadata = {
  title: 'Privacy Policy | Ziro',
}

export default function PrivacyPolicyPage() {
  return (
    <article className="max-w-none text-slate-700 leading-relaxed space-y-6 pb-24">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 font-medium mb-12">Last Updated: 19 September 2026</p>

      <p>
        At Ziro, accessible from our platform, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by Ziro and how we use it.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">1. Information We Collect</h2>
      <p>
        We collect several different types of information for various purposes to provide and improve our financial services to you:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600">
        <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you, such as your email address, name, phone number, and KYC documents necessary for financial compliance.</li>
        <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used. This Usage Data may include information such as your device's Internet Protocol address (e.g. IP address), browser type, the pages of our Service that you visit, the time and date of your visit, and the time spent on those pages.</li>
        <li><strong>Financial Data:</strong> When utilizing Ziro for remittances or the Offline Vault, we securely process transaction hashes, amounts, and settlement states.</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">2. How We Use Your Information</h2>
      <p>
        Ziro uses the collected data for various purposes:
      </p>
      <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600">
        <li>To provide and maintain our Service, including TrustScore calculations (zk-Credit) and consultant matchmaking.</li>
        <li>To notify you about changes to our Service.</li>
        <li>To allow you to participate in interactive features of our Service when you choose to do so.</li>
        <li>To provide customer care and support through human consultants.</li>
        <li>To detect, prevent and address technical issues or fraudulent transactions.</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">3. Zero-Knowledge Credit (zk-Credit)</h2>
      <p>
        Ziro utilizes zero-knowledge proofs to evaluate your financial behavior (TrustScore) without requiring us to store or see your raw underlying banking transactions. Your financial privacy is a core architectural pillar of our TrustScore system.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">4. Third-Party Services</h2>
      <p>
        Ziro may employ third-party companies and individuals to facilitate our Service ("Service Providers"), such as payment gateways or KYC verification partners. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">5. Contact Us</h2>
      <p>
        If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at <a href="mailto:privacy@ziro.com" className="text-blue-600 hover:underline">privacy@ziro.com</a>.
      </p>
    </article>
  )
}
