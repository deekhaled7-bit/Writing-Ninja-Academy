import { Sword, Heart, Shield, Target, Users, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ninja-cream">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ninja-peach via-ninja-cream to-ninja-peach py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-ninja  text-4xl sm:text-6xl text-ninja-black mb-6">
            About The Writing Ninjas
          </h1>
          <p className="text-xl text-ninja-gray opacity-90 leading-relaxed">
            Where young voices become legendary stories, and every child
            discovers the ninja within them through the power of creative
            writing.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-ninja-white text-ninja-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-ninja text-3xl sm:text-4xl text-ninja-black mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-ninja-gray text-lg leading-relaxed">
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
            <div className="ninja-scroll bg-ninja-cream p-8 text-center">
              <div className="w-24 h-24 bg-ninja-peach rounded-full flex items-center justify-center mx-auto mb-6">
                <Sword className="h-12 w-12 text-ninja-black" />
              </div>
              <h3 className="font-ninja text-2xl text-ninja-crimson mb-4">
                Empowering Young Voices
              </h3>
              <p className="text-ninja-gray">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Safety First",
                description:
                  "We maintain a safe, moderated environment where young writers can express themselves without worry.",
                color: "ninja-peach",
              },
              // {
              //   icon: Heart,
              //   title: "Kindness Always",
              //   description:
              //     "Every interaction on our platform is built on respect, encouragement, and constructive feedback.",
              //   color: "ninja-gold",
              // },
              {
                icon: Target,
                title: "Growth Mindset",
                description:
                  "We celebrate progress, effort, and creativity, helping every young writer improve their craft.",
                color: "ninja-peach",
              },
              {
                icon: Users,
                title: "Community Spirit",
                description:
                  "Writers support writers. We foster connections between young storytellers worldwide.",
                color: "ninja-peach",
              },
              {
                icon: BookOpen,
                title: "Love of Learning",
                description:
                  "Reading and writing go hand in hand. We inspire young people to both create and discover stories.",
                color: "ninja-peach",
              },
              // {
              //   icon: Sword,
              //   title: "Creative Courage",
              //   description:
              //     "We encourage young writers to be brave with their stories and proud of their unique voice.",
              //   color: "ninja-gold",
              // },
            ].map((value, index) => (
              <div
                key={index}
                className="ninja-scroll bg-ninja-cream p-8 text-center ninja-hover group"
              >
                <div
                  className={`w-16 h-16 bg-${value.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className="h-8 w-8 text-ninja-black" />
                </div>
                <h3 className="font-ninja text-xl text-ninja-crimson transition-colors">
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
      <section className="py-20 bg-ninja-white">
        <div className="max-w-4xl  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ninja-scroll p-12 bg-ninja-cream text-ninja-black">
            <h2 className="font-ninja text-ninja-crimson text-3xl sm:text-4xl  mb-8 text-center">
              How The Writing Ninja Began
            </h2>
            <div className="space-y-6  text-lg leading-relaxed">
              <p className="text-ninja-gray">
                It all started with a group of passionate educators who cared
                deeply about their students&apos; growth and well-being. They
                wanted to encourage every child to feel proud of their work, so
                they created a &quot;Wall of Fame&quot; where student
                achievements could be celebrated.
              </p>
              <p>
                From that simple idea grew something bigger: a space where
                students could not only share their writing but also learn from
                one another. We believe in the power of peer learning — when
                children read stories written by other children, they are
                inspired, motivated, and reminded that their voices matter too.
              </p>
              <p>
                The Writing Ninja was born from this belief: a safe, fun, and
                inspiring platform where young writers can shine, and readers
                can discover the magic of words created by kids just like them.
              </p>
              <p className=" font-semibold text-center">
                Today, we&apos;re proud to be the home where thousands of young
                voices become legendary stories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br bg-ninja-white">
        <div className="max-w-4xl mx-auto rounded-2xl p-4 sm:p-6 lg:p-8 bg-ninja-gold text-center">
          <h2 className="font-ninja text-3xl sm:text-4xl text-ninja-black mb-6">
            Join Our Ninja Dojo
          </h2>
          <p className="text-xl text-ninja-gray opacity-90 mb-8">
            Ready to start your writing adventure? Every great story begins with
            a single word.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a
              href="/upload"
              className="inline-block bg-ninja-crimson  text-ninja-white px-8 py-4 rounded-lg font-semibold ninja-hover transition-all duration-200"
            >
              Share Your First Story
            </a>
            <a
              href="/explore"
              className="inline-block bg-transparent border-2 border-ninja-black text-ninja-black hover:bg-ninja-black hover:text-ninja-white px-8 py-4 rounded-lg font-semibold ninja-hover transition-all duration-200"
            >
              Explore Amazing Stories
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
