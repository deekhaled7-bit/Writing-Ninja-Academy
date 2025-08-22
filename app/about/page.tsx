import { Sword, Heart, Shield, Target, Users, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ninja-black">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ninja-black via-ninja-crimson to-ninja-black py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-ninja  text-4xl sm:text-6xl text-ninja-white mb-6">
            About The Writing Ninja
          </h1>
          <p className="text-xl text-ninja-white opacity-90 leading-relaxed">
            Where young voices become legendary stories, and every child
            discovers the ninja within them through the power of creative
            writing.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-ninja text-3xl sm:text-4xl text-ninja-light-gray mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-ninja-light-gray text-lg leading-relaxed">
                <p>
                  The Writing Ninja was born from a simple belief: every child
                  has an amazing story to tell, and they deserve a safe,
                  inspiring platform to share their creativity with the world.
                </p>
                <p>
                  We&apos;re building more than just a story-sharing platform.
                  We&apos;re creating a dojo where young writers can train their
                  craft, connect with fellow storytellers, and grow their
                  confidence through the ancient art of storytelling.
                </p>
                <p>
                  Just like ninjas master their skills through practice and
                  community, young writers flourish when they have the right
                  environment to express themselves and learn from others.
                </p>
              </div>
            </div>
            <div className="ninja-scroll bg-gradient-to-br from-ninja-black via-ninja-crimson to-ninja-black p-8 text-center">
              <div className="w-24 h-24 bg-ninja-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Sword className="h-12 w-12 text-ninja-white" />
              </div>
              <h3 className="font-ninja text-2xl text-ninja-light-gray mb-4">
                Empowering Young Voices
              </h3>
              <p className="text-ninja-light-gray">
                Every story shared here is a victory, every comment is
                encouragement, and every young writer who finds their voice is
                our greatest achievement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-ninja-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-ninja text-3xl sm:text-4xl text-ninja-black mb-6">
              Our Ninja Values
            </h2>
            <p className="text-xl text-ninja-gray max-w-3xl mx-auto">
              These principles guide everything we do at The Writing Ninja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safety First",
                description:
                  "We maintain a safe, moderated environment where young writers can express themselves without worry.",
                color: "ninja-crimson",
              },
              {
                icon: Heart,
                title: "Kindness Always",
                description:
                  "Every interaction on our platform is built on respect, encouragement, and constructive feedback.",
                color: "ninja-gold",
              },
              {
                icon: Target,
                title: "Growth Mindset",
                description:
                  "We celebrate progress, effort, and creativity, helping every young writer improve their craft.",
                color: "ninja-crimson",
              },
              {
                icon: Users,
                title: "Community Spirit",
                description:
                  "Writers support writers. We foster connections between young storytellers worldwide.",
                color: "ninja-gold",
              },
              {
                icon: BookOpen,
                title: "Love of Learning",
                description:
                  "Reading and writing go hand in hand. We inspire young people to both create and discover stories.",
                color: "ninja-crimson",
              },
              {
                icon: Sword,
                title: "Creative Courage",
                description:
                  "We encourage young writers to be brave with their stories and proud of their unique voice.",
                color: "ninja-gold",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="ninja-scroll p-8 text-center ninja-hover group"
              >
                <div
                  className={`w-16 h-16 bg-${value.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className="h-8 w-8 text-ninja-white" />
                </div>
                <h3 className="font-ninja text-xl text-ninja-black mb-4 group-hover:text-ninja-crimson transition-colors">
                  {value.title}
                </h3>
                <p className="text-ninja-gray leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ninja-scroll p-12">
            <h2 className="font-ninja text-3xl sm:text-4xl text-ninja-black mb-8 text-center">
              How The Writing Ninja Began
            </h2>
            <div className="space-y-6 text-ninja-gray text-lg leading-relaxed">
              <p>
                It all started when we noticed something incredible: kids have
                the most amazing imaginations, but often lack a platform
                designed just for them to share their creative stories safely.
              </p>
              <p>
                We watched young writers share their work on platforms not built
                for their needs, getting lost in the noise or feeling
                discouraged by inappropriate feedback. That&apos;s when we knew
                something had to change.
              </p>
              <p>
                The Writing Ninja was created by a team of educators, parents,
                and former young writers who understand what it takes to nurture
                creativity in children. We&apos;ve designed every feature with
                young writers in mind, from our ninja-themed gamification to our
                careful content moderation.
              </p>
              <p className="text-ninja-black font-semibold text-center">
                Today, we&apos;re proud to be the home where thousands of young
                voices become legendary stories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-ninja-black via-ninja-gray to-ninja-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-ninja text-3xl sm:text-4xl text-ninja-white mb-6">
            Join Our Ninja Dojo
          </h2>
          <p className="text-xl text-ninja-white opacity-90 mb-8">
            Ready to start your writing adventure? Every great story begins with
            a single word.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a
              href="/upload"
              className="inline-block bg-ninja-crimson hover:bg-red-600 text-ninja-white px-8 py-4 rounded-lg font-semibold ninja-hover transition-all duration-200"
            >
              Share Your First Story
            </a>
            <a
              href="/explore"
              className="inline-block bg-transparent border-2 border-ninja-gold text-ninja-gold hover:bg-ninja-gold hover:text-ninja-black px-8 py-4 rounded-lg font-semibold ninja-hover transition-all duration-200"
            >
              Explore Amazing Stories
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
