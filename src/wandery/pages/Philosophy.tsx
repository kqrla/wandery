import Shell, { Display, Eyebrow, H2, Lead, P, Rule } from "./Shell";

export default function Philosophy() {
  return (
    <Shell active="philosophy">
      <Eyebrow>philosophy · a small manifesto</Eyebrow>
      <Display>maps are living things.</Display>
      <Lead>
        wandery treats maps not as static facts but as living systems —
        layered, contested, gently inherited, slowly redrawn.
      </Lead>

      <H2>geography shapes identity</H2>
      <P>
        an island is a different kind of country than a steppe. a delta society
        thinks differently than a mountain one. geography is not destiny, but it
        is grammar.
      </P>

      <H2>borders are temporary</H2>
      <P>
        the dotted lines we know today are mostly less than a hundred years old.
        scrub the timeline dial backwards and watch them dissolve into empires,
        federations, principalities, leagues.
      </P>

      <H2>cultures overlap</H2>
      <P>
        a single valley can hold three languages, two alphabets and a religion
        the official map forgot. wandery's overlays are deliberately translucent
        so they can be stacked — eu over nato over francophone — and read
        together.
      </P>

      <H2>alliances evolve</H2>
      <P>
        nato today is not nato in 1955. the eu in 1995 looked nothing like it
        does now. blocs breathe.
      </P>

      <H2>language transcends borders</H2>
      <P>
        slavic languages do not stop at the polish frontier. arabic flows from
        morocco to oman. the linguistic layer is one of wandery's quietest and
        most honest readings.
      </P>

      <H2>history is layered</H2>
      <P>
        every place is many places, indexed by year. wandery refuses to flatten
        them. you can hold "ottoman territory" and "modern bulgaria" in the same
        breath without resolving them.
      </P>

      <H2>learning is exploration</H2>
      <P>
        movement of the mind counts. the atlas is a room in which to wander.
      </P>

      <Rule />
      <p className="text-xs italic text-muted-foreground">
        — drafted in the margins of a paper map, somewhere between 1914 and now.
      </p>
    </Shell>
  );
}