import { Link } from 'react-router-dom';

// Reusable Policy Header Component
function PolicyHeader() {
  return (
    <header className="fixed top-0 w-full bg-timberwolf/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2"
        >
          <span className="text-2xl font-black tracking-tight text-brunswick-green">
            Spevents
          </span>
        </Link>
      </div>
    </header>
  );
}

// Footer Component
export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-brunswick-green/5 border-t border-sage/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-hunter-green text-sm">
            Copyright © {currentYear} Spevents. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link 
              to="/terms" 
              className="text-hunter-green hover:text-brunswick-green text-sm transition-colors"
            >
              Terms of Use
            </Link>
            <span className="text-hunter-green">·</span>
            <Link 
              to="/privacy" 
              className="text-hunter-green hover:text-brunswick-green text-sm transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Terms of Use Page Component
export function Terms() {
  return (
    <div className="min-h-screen bg-timberwolf">
      <PolicyHeader />
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-brunswick-green mb-8">Terms of Use</h1>
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 space-y-6 text-hunter-green">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Spevents' services, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
            <p>Spevents provides a real-time photo sharing and curation platform for events. Our service allows event attendees to upload and share photos through QR code scanning without requiring app downloads.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 13 years old to use our services</li>
              <li>You agree not to upload any inappropriate, illegal, or copyrighted content</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to misuse or attempt to disrupt our services</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Photo Content Guidelines</h2>
            <p>Users must ensure uploaded photos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not violate any laws or regulations</li>
              <li>Do not infringe on others' intellectual property rights</li>
              <li>Do not contain explicit or inappropriate content</li>
              <li>Are relevant to the event they are uploaded to</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Privacy & Data Usage</h2>
            <p>We respect your privacy and handle your data in accordance with our Privacy Policy. By using our services, you consent to our data collection and usage practices as outlined in the Privacy Policy.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Service Modifications</h2>
            <p>We reserve the right to modify or discontinue our services at any time. We will provide reasonable notice of any significant changes that affect user access or functionality.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p>Spevents is not liable for any damages arising from the use or inability to use our services. This includes but is not limited to direct, indirect, incidental, or consequential damages.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Privacy Policy Page Component
export function Privacy() {
  return (
    <div className="min-h-screen bg-timberwolf">
      <PolicyHeader />
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-brunswick-green mb-8">Privacy Policy</h1>
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 space-y-6 text-hunter-green">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Photos uploaded through our platform</li>
              <li>Event information and metadata</li>
              <li>Device and browser information</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our photo sharing services</li>
              <li>Maintain and optimize platform performance</li>
              <li>Communicate with users about their events</li>
              <li>Ensure compliance with our terms and policies</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
            <p>We implement appropriate security measures to protect your information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Secure data encryption in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Limited access to personal information</li>
              <li>Secure cloud storage providers</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With event organizers for their specific events</li>
              <li>With service providers who assist our operations</li>
              <li>When required by law or to protect rights</li>
              <li>With your consent</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Update or correct your information</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our practices, please contact us at spevents.party@gmail.com</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}