import Link from "next/link";
import { Sword, Heart } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-ninja-black border-t border-ninja-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo/logoRed.png"
                alt="logo"
                width={64}
                height={64}
              />

              <span className="font-ninja text-2xl text-ninja-white">
                The Writing Ninja Academy
              </span>
            </Link>
            <p className="text-ninja-white opacity-80 max-w-md">
              Where young authors discover their voice and share their
              incredible stories with the world. Every story matters, every
              voice counts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-ninja text-lg text-ninja-white mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                href="/explore"
                className="block text-ninja-white opacity-80 hover:text-ninja-gold transition-colors"
              >
                Explore Stories
              </Link>
              <Link
                href="/about"
                className="block text-ninja-white opacity-80 hover:text-ninja-gold transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/how-it-works"
                className="block text-ninja-white opacity-80 hover:text-ninja-gold transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/contact"
                className="block text-ninja-white opacity-80 hover:text-ninja-gold transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* For Parents */}
          <div>
            <h3 className="font-ninja text-lg text-ninja-white mb-4">
              For Parents
            </h3>
            <div className="space-y-2">
              <Link
                href="/safety"
                className="block text-ninja-white opacity-80 hover:text-ninja-gold transition-colors"
              >
                Safety Guidelines
              </Link>
              <Link
                href="/privacy"
                className="block text-ninja-white opacity-80 hover:text-ninja-gold transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-ninja-white opacity-80 hover:text-ninja-gold transition-colors"
              >
                Terms of Use
              </Link>
              <Link
                href="/support"
                className="block text-ninja-white opacity-80 hover:text-ninja-gold transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-ninja-gray mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-ninja-white opacity-60 text-sm">
            © 2025 The Writing Ninja. All rights reserved.
          </p>
          <div className="flex items-center text-ninja-white opacity-60 text-sm mt-2 sm:mt-0">
            Made with <Heart className="h-4 w-4 mx-1 text-ninja-crimson" /> for
            young writers
          </div>
        </div>
      </div>
    </footer>
  );
}
