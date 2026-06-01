import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users, Heart, Hammer, Library, Compass } from "lucide-react";
import MarketingShell from "@/pages/MarketingShell";

// /about — explains the why of fabnet. who built it, who it is for,
// and the values behind it. keep tone calm and lowercase.

export default function AboutPage() {
  return (
    <MarketingShell active="about">
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-5">
          about fabnet
        </p>
        <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
          a quiet atlas for people who make physical things.
        </h1>
        <p className="mt-7 text-lg text-muted-foreground leading-relaxed">
          fabnet exists because finding a 3d printer, a laser cutter, or a
          neighbour with a vinyl cutter should not require a marketplace, a
          subscription, or an algorithm ranking strangers against each other.
          it should feel like opening a small, well-drawn map of your city.
        </p>
      </section>

      <section className="border-t border-border bg-background/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-20 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3">why this exists</h2>
            <p className="text-muted-foreground leading-relaxed">
              most fabrication knowledge lives in private chats, hobby forums,
              and printed flyers taped to library doors. fabnet collects that
              local knowledge into a single, calm surface so the next person
              looking for a printer does not have to start from zero.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">who it is for</h2>
            <ul className="text-muted-foreground leading-relaxed space-y-2">
              <li>students who need to print a project before friday.</li>
              <li>hobbyists looking for someone with a resin printer nearby.</li>
              <li>librarians and makerspace staff who want to be findable.</li>
              <li>makers who quietly own great tools and would help if asked.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">what it is not</h2>
            <p className="text-muted-foreground leading-relaxed">
              not a marketplace. not a gig platform. not a ranked directory.
              there are no stars, no leaderboards, and no paid placement.
              every listing is human-reviewed before it appears.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          values
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
          four small commitments.
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { icon: Heart,   title: "human-curated",  body: "every place and maker is reviewed by a person before going live." },
            { icon: MapPin,  title: "local first",    body: "anchored to real cities and real districts you can walk or cycle to." },
            { icon: Library, title: "public friendly", body: "libraries, university labs, and community spaces are first-class citizens." },
            { icon: Compass, title: "calm by design", body: "no notifications, no streaks, no manipulative patterns." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-card border border-border rounded-lg p-6">
              <Icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-background/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-5">
            two surfaces, one idea.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
            fabnet has two views of the same world. the main map indexes
            physical places. the local network indexes people. together they
            answer "where can i make this?" and "who near me can?".
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <Link to="/" className="bg-card border border-border rounded-lg p-6 hover:border-primary/60 transition-colors">
              <Hammer className="h-5 w-5 text-primary mb-3" />
              <div className="font-semibold mb-1">open the map</div>
              <p className="text-sm text-muted-foreground">places, opening hours, capabilities.</p>
            </Link>
            <Link to="/localnetwork" className="bg-card border border-border rounded-lg p-6 hover:border-primary/60 transition-colors">
              <Users className="h-5 w-5 text-primary mb-3" />
              <div className="font-semibold mb-1">browse local network</div>
              <p className="text-sm text-muted-foreground">neighbours with the tools to help.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-5">
          want to see the features?
        </h2>
        <Link to="/features" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          view features <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </MarketingShell>
  );
}