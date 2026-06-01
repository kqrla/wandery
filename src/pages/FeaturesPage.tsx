import { Link } from "react-router-dom";
import {
  ArrowRight, Search, MapPin, Users, Radar, Filter, Layers,
  Clock, Sparkles, ShieldCheck, Map, MessageSquare,
} from "lucide-react";
import MarketingShell from "@/pages/MarketingShell";

// /features — a structured walkthrough of what fabnet does today.
// grouped into the two main surfaces plus shared behaviours.

const MAP_FEATURES = [
  { icon: MapPin, title: "city-by-city atlas",     body: "seven cities and growing, each anchored to local districts and postcodes." },
  { icon: Search, title: "zip / postcode search",  body: "jump straight to your area. the map snaps to the right district." },
  { icon: Filter, title: "capability filters",     body: "filter places by 3d printing, laser, cnc, electronics, sewing, and more." },
  { icon: Layers, title: "three calm themes",      body: "default, pink, and sage — pick the palette that reads best for you." },
  { icon: Clock,  title: "opening hours at a glance", body: "see when a place is open before walking over." },
  { icon: Map,    title: "hover previews",         body: "quick tooltip on every pin before you commit to opening a card." },
];

const NETWORK_FEATURES = [
  { icon: Users,         title: "maker profiles",       body: "alias, gear list, materials, availability, and a service radius." },
  { icon: Radar,         title: "neighbourhood matching", body: "find a maker near your postcode, not across the country." },
  { icon: MessageSquare, title: "simple requests",      body: "send a short brief, get a reply. no bidding, no auctions." },
  { icon: ShieldCheck,   title: "human review",         body: "every maker is approved by hand before going live." },
  { icon: Sparkles,      title: "capability tags",      body: "multicolor, precision, large format, hobby-friendly, and more." },
  { icon: MapPin,        title: "public maker pages",   body: "optional /m/@alias page makers can share when they want to." },
];

function FeatureCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <Icon className="h-5 w-5 text-primary mb-3" />
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <MarketingShell active="features">
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-5">
          features
        </p>
        <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
          everything fabnet does, in one calm list.
        </h1>
        <p className="mt-7 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          two surfaces, one idea. the map indexes places. the local network
          indexes people. both work without an account, and both stay readable.
        </p>
      </section>

      <section className="border-t border-border bg-background/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
            <MapPin className="h-3.5 w-3.5" /> fabnet map
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
            places you can walk into.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MAP_FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
          <Users className="h-3.5 w-3.5" /> local network
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
          people who already make things.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {NETWORK_FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      <section className="border-t border-border bg-background/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
            shared
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
            behaviours across both surfaces.
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <FeatureCard icon={ShieldCheck} title="human-reviewed entries" body="no scraped listings. every entry is approved before going live." />
            <FeatureCard icon={Sparkles}    title="no marketplace dynamics" body="no ratings, no leaderboards, no paid placement." />
            <FeatureCard icon={Map}         title="lightweight tech"      body="leaflet + voyager tiles, tinted with css. fast everywhere." />
            <FeatureCard icon={Search}      title="works without an account" body="looking, searching, and filtering never require sign-in." />
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-5">
          ready to look around?
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            open the map <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/localnetwork" className="inline-flex items-center gap-2 bg-card border border-border px-5 py-3 rounded-md text-sm font-medium hover:bg-accent/30 transition-colors">
            browse local network
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}