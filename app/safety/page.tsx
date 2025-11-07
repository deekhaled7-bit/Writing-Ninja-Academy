import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions – The Writing Ninjas Academy",
  description: "Terms and Conditions for The Writing Ninjas Academy website.",
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-ninja-white">
      {/* Hero */}
      <section className="bg-ninja-peach">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="font-oswald text-4xl md:text-6xl text-ninja-white mb-2">
            Terms and Conditions
          </h1>
          <p className="text-ninja-white/90">Last updated: November 2025</p>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white shadow-sm rounded-lg border border-ninja-coral/20">
            <div className="p-6 sm:p-8">
              <p className="text-ninja-black mb-6">
                Welcome to The Writing Ninjas Academy. By accessing and using
                our website (www.thewritingninjasacademy.org), you agree to
                comply with and be bound by the following Terms and Conditions.
                Please read them carefully. If you do not agree, you should
                discontinue use of the Site immediately.
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="font-oswald text-2xl text-ninja-crimson mb-3">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-ninja-black">
                    By using the Site, you acknowledge that you have read,
                    understood, and agreed to these Terms and Conditions.
                  </p>
                </section>

                <section>
                  <h2 className="font-oswald text-2xl text-ninja-crimson mb-3">
                    2. Intellectual Property
                  </h2>
                  <p className="text-ninja-black">
                    All content and materials available on the Site—including
                    but not limited to text, graphics, logos, icons, images,
                    audio clips, digital downloads, data compilations, and
                    software—are the exclusive property of The Writing Ninjas
                    Academy or its content suppliers, and are protected under
                    applicable international copyright and intellectual property
                    laws.
                  </p>
                </section>

                <section>
                  <h2 className="font-oswald text-2xl text-ninja-crimson mb-3">
                    3. License and Access
                  </h2>
                  <p className="text-ninja-black mb-3">
                    We grant you a limited, non-exclusive, non-transferable
                    license to access and make personal use of the Site. This
                    license does not permit:
                  </p>
                  <ul className="list-disc pl-6 text-ninja-black space-y-2">
                    <li>
                      Any resale or commercial use of the Site or its content.
                    </li>
                    <li>
                      The reproduction, duplication, copying, or exploitation of
                      any portion of the Site without prior written consent from
                      The Writing Ninjas Academy.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-oswald text-2xl text-ninja-crimson mb-3">
                    4. eBooks and Digital Products
                  </h2>
                  <p className="text-ninja-black mb-2">
                    a. eBooks and other digital products available on the Site
                    are provided for personal use only and may not be shared,
                    reproduced, distributed, or resold without express written
                    permission from The Writing Ninjas Academy.
                  </p>
                  <p className="text-ninja-black">
                    b. We are not responsible for compatibility issues between
                    our digital products and any third-party devices,
                    applications, or software.
                  </p>
                </section>

                <section>
                  <h2 className="font-oswald text-2xl text-ninja-crimson mb-3">
                    5. Privacy Policy
                  </h2>
                  <p className="text-ninja-black">
                    Your use of the Site is also governed by our {" "}
                    <Link href="/privacy" className="text-ninja-crimson underline">
                      Privacy Policy
                    </Link>
                    , which explains how we collect, use, and protect your information.
                  </p>
                </section>

                <section>
                  <h2 className="font-oswald text-2xl text-ninja-crimson mb-3">
                    6. Limitation of Liability
                  </h2>
                  <p className="text-ninja-black">
                    The Writing Ninjas Academy shall not be held liable for any
                    direct, indirect, incidental, special, or consequential
                    damages arising from or related to your use of—or inability
                    to use—the Site or its content, including reliance on
                    information provided through the Site.
                  </p>
                </section>

                <section>
                  <h2 className="font-oswald text-2xl text-ninja-crimson mb-3">
                    7. Governing Law
                  </h2>
                  <p className="text-ninja-black">
                    These Terms and Conditions shall be governed by and
                    construed in accordance with the laws of Egypt. Any disputes
                    arising under these Terms shall be subject to the exclusive
                    jurisdiction of the courts of Egypt.
                  </p>
                </section>

                <section>
                  <h2 className="font-oswald text-2xl text-ninja-crimson mb-3">
                    8. Changes to Terms
                  </h2>
                  <p className="text-ninja-black">
                    We reserve the right to update, modify, or revise these
                    Terms and Conditions at any time, without prior notice.
                    Continued use of the Site after such changes constitutes
                    your acceptance of the updated Terms.
                  </p>
                </section>

                <section>
                  <h2 className="font-oswald text-2xl text-ninja-crimson mb-3">
                    Acknowledgment
                  </h2>
                  <p className="text-ninja-black">
                    By using the Site, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms and
                    Conditions.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
