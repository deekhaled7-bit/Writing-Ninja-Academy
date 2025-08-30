import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-ninja-cream">
      {/* Hero Section - Same as About Page */}
      <section className="bg-gradient-to-br from-ninja-cream via-ninja-peach to-ninja-gold py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-ninja text-4xl sm:text-6xl text-ninja-black mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-ninja-gray opacity-90 leading-relaxed">
            Ready to embark on your writing journey? Reach out to us and
            let&apos;s sharpen your storytelling skills together.
          </p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-20 bg-ninja-white text-ninja-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-ninja-cream p-8 rounded-lg border-2 border-ninja-peach /30">
              <h2 className="font-ninja text-3xl text-ninja-crimson mb-6">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-ninja-black text-sm font-medium mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-ninja-cream border-2 border-ninja-peach  rounded-lg text-ninja-black placeholder-ninja-gray focus:outline-none focus:border-ninja-crimson transition-colors"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-ninja-black text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-ninja-cream border-2 border-ninja-peach  rounded-lg text-ninja-black placeholder-ninja-gray focus:outline-none focus:border-ninja-crimson transition-colors"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ninja-black text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-ninja-cream border-2 border-ninja-peach  rounded-lg text-ninja-black placeholder-ninja-gray focus:outline-none focus:border-ninja-crimson transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-ninja-black text-sm font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-ninja-cream border-2 border-ninja-peach  rounded-lg text-ninja-black placeholder-ninja-gray focus:outline-none focus:border-ninja-crimson transition-colors"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="block text-ninja-black text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-ninja-cream border-2 border-ninja-peach  rounded-lg text-ninja-black placeholder-ninja-gray focus:outline-none focus:border-ninja-crimson transition-colors resize-none"
                    placeholder="Tell us about your writing journey or ask us anything..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-ninja-crimson text-ninja-white font-semibold py-3 px-6 rounded-lg hover:from-red-600 hover:to-ninja-crimson transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="font-ninja text-3xl text-ninja-black mb-4">
                  Get in Touch
                </h2>
                <p className="text-ninja-gray text-lg leading-relaxed mb-8">
                  Whether you&apos;re a young writer ready to share your
                  stories, a parent looking for a safe creative space for your
                  child, or an educator interested in our platform, we&apos;d
                  love to hear from you.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="bg-ninja-cream p-6 rounded-lg border-2 border-ninja-peach ">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-ninja-peach rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-ninja-black" />
                    </div>
                    <div>
                      <h3 className="text-ninja-crimson tracking-wide font-semibold text-lg">
                        Email Us
                      </h3>
                      <p className="text-ninja-gray">hello@writingninja.com</p>
                    </div>
                  </div>
                </div>

                <div className="bg-ninja-cream p-6 rounded-lg border-2 border-ninja-peach">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-ninja-peach rounded-full flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-ninja-black" />
                    </div>
                    <div>
                      <h3 className="text-ninja-crimson tracking-wide font-semibold text-lg">
                        Live Chat
                      </h3>
                      <p className="text-ninja-gray">
                        Available 9 AM - 5 PM EST
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-ninja-cream p-6 rounded-lg border-2 border-ninja-peach">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-ninja-peach rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-ninja-black" />
                    </div>
                    <div>
                      <h3 className="text-ninja-crimson tracking-wide font-semibold text-lg">
                        Response Time
                      </h3>
                      <p className="text-ninja-gray">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="border-2 border-ninja-peach bg-ninja-cream p-8 rounded-lg">
                <h3 className="font-ninja text-2xl text-ninja-crimson mb-4">
                  Quick Questions?
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-ninja-black font-semibold mb-2">
                      Is the platform safe for children?
                    </h4>
                    <p className="text-ninja-gray text-sm">
                      Absolutely! We have strict moderation and safety measures
                      in place.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-ninja-black font-semibold mb-2">
                      How do I get started?
                    </h4>
                    <p className="text-ninja-gray text-sm">
                      Simply create an account and start sharing your stories
                      with our community.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-ninja-black font-semibold mb-2">
                      Can parents monitor their child&apos;s activity?
                    </h4>
                    <p className="text-ninja-black text-sm">
                      Yes, we provide parent dashboards and regular activity
                      reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-ninja-crimson to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-ninja text-3xl sm:text-4xl text-ninja-white mb-4">
            Ready to Begin Your Writing Adventure?
          </h2>
          <p className="text-xl text-ninja-white opacity-90 mb-8">
            Join thousands of young writers who are already sharpening their
            skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-ninja-white text-ninja-crimson font-semibold py-3 px-8 rounded-lg hover:bg-ninja-light-gray transition-colors">
              Start Writing Today
            </button>
            <button className="border-2 border-ninja-white text-ninja-white font-semibold py-3 px-8 rounded-lg hover:bg-ninja-white hover:text-ninja-crimson transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
