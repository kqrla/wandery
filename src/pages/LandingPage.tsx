import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users, Package, Search, Radar, Sparkles } from "lucide-react";
import { CITIES } from "@/data/cities";
import MarketingShell from "@/pages/MarketingShell";

// landing page at /landing.
//
// purpose: give first-time visitors a calm, readable explanation of what
// fabnet is, what the two surfaces (map + localnetwork) do, and where to
// go next. it lives outside the map shell so it can scroll naturally.
//
// design notes:
// - reuses the same semantic tokens (background, primary, accent, muted)
//   so theme switches still apply if a user lands here later in a session
// - body has overflow:hidden globally for the map; we re-enable scroll
//   only while this page is mounted via a small effect
// - everything lowercase per project writing rules. no emojis, no em dashes.

export default function LandingPage() {
  return (
    <MarketingShell active="landing">
      {/* hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-5">
          a quiet map for makers
        </p>
        <h1 className="text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight max-w-4xl">
          find places to make things.
          <br />
          <span className="text-primary">find people who already do.</span>
        </h1>
        <p className="mt-7 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          fabnet is a small, human-curated atlas of where physical things get
          made in your city. libraries with 3d printers, public workshops,
          university labs, and the neighbours who quietly own a resin printer
          or a vinyl cutter.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            open the map <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/localnetwork"
            className="inline-flex items-center gap-2 bg-card border border-border px-5 py-3 rounded-md text-sm font-medium hover:bg-accent/30 transition-colors"
          >
            browse local network
          </Link>
        </div>
      </section>

      {/* two-surface explainer */}
      <section id="what" className="border-t border-border bg-background/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-8">
          <article className="bg-card border border-border rounded-lg p-8">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
              <MapPin className="h-3.5 w-3.5" /> fabnet map
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              where can i make things?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              a city map of public and semi-public fabrication spaces. libraries
              with printers, makerspaces, university labs, and shared workshops.
              filter by what you need, see opening hours, walk in.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              open the map <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>

          <article className="bg-card border border-border rounded-lg p-8">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
              <Users className="h-3.5 w-3.5" /> local network
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              who near me can make this?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              a distributed map of individuals who own the tools and are happy
              to help. 3d printers, resin, cnc, vinyl cutters, laser. send a
              request, get matched with someone a few blocks away.
            </p>
            <Link
              to="/localnetwork"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              browse local network <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          how it works
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-12 max-w-2xl">
          three small steps, no account required to look.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Search,
              title: "search your area",
              body: "type a zip code or postcode. the map snaps to your district and shows what is nearby.",
            },
            {
              icon: Radar,
              title: "see who can help",
              body: "hover any pin for a quick preview. open the card to see capabilities, materials, and availability.",
            },
            {
              icon: Package,
              title: "request or visit",
              body: "walk in to a public space, or submit a short request to a local maker. simple and direct.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-card border border-border rounded-lg p-6">
              <Icon className="h-5 w-5 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* principles */}
      <section className="border-t border-border bg-background/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
          <div>
            <Sparkles className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold mb-2">human-curated</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              every place and every maker is reviewed by hand before going live.
              no scraped listings, no auto-imported noise.
            </p>
          </div>
          <div>
            <Users className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold mb-2">not a marketplace</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              no ratings, no leaderboards, no gamification. fabnet is an atlas,
              not a platform that ranks people against each other.
            </p>
          </div>
          <div>
            <MapPin className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold mb-2">local first</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              everything is anchored to a real city and a real district. the
              point is to walk, cycle, or short-trip to where things happen.
            </p>
          </div>
        </div>
      </section>

      {/* cities */}
      <section id="cities" className="max-w-6xl mx-auto px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
          live in
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
          {CITIES.length} cities, slowly growing.
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {CITIES.map(city => {
            const slug = city.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
              <Link
                key={city.id}
                to={`/${slug}`}
                className="group bg-card border border-border rounded-md px-4 py-3 flex items-center justify-between hover:border-primary/60 transition-colors"
              >
                <span className="text-sm font-medium lowercase">{city.name.toLowerCase()}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* call to action */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-5">
            open the map. see your city differently.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            it takes about thirty seconds to find a place near you that prints,
            cuts, mills, or solders the thing you have been meaning to make.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              open the map <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/localnetwork/join"
              className="inline-flex items-center gap-2 bg-card border border-border px-5 py-3 rounded-md text-sm font-medium hover:bg-accent/30 transition-colors"
            >
              join as a maker
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}