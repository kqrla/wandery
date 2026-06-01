import Shell, { Display, Eyebrow, H2, Lead, P, Rule } from "./Shell";

export default function About() {
  return (
    <Shell active="about">
      <Eyebrow>about · vol. i</Eyebrow>
      <Display>a living atlas, not a travel tracker.</Display>
      <Lead>
        wandery is a living atlas for exploring geography, history, culture,
        language, alliances and identity through interactive cartography.
      </Lead>

      <P>
        let us say this plainly: wandery is not a travel-tracking platform.
        physical travel is so often tied to privilege, borders, mobility
        restrictions, finances, disability and unequal access. counting countries
        you have set foot in becomes — quietly — a kind of status object.
      </P>
      <P>
        we are interested in a different question. what if curiosity, study and
        imagination were treated as meaningful forms of movement? what if a
        winter spent reading about the baltics counted as a real way of going
        there?
      </P>

      <H2>why maps matter</H2>
      <P>
        maps are not neutral. they are political documents, emotional artifacts,
        ancestral inheritances. they encode who is centred and who is at the
        edge. wandery treats every overlay as one possible reading among many.
      </P>

      <H2>geography as identity</H2>
      <P>
        language, food, music, faith, kinship and weather all settle into the
        contours of land. to understand a region is to read its rivers, its
        mountain passes, its harbours and the way borders have shifted over its
        people.
      </P>

      <H2>borders across time</H2>
      <P>
        nation-states are recent. dotted lines on paper outlast the regimes that
        drew them. the timeline dial inside the atlas exists so the past can sit
        next to the present without being collapsed into it.
      </P>

      <H2>exploration beyond tourism</H2>
      <P>
        we use a different vocabulary on purpose. instead of <em>visited</em> we
        say <em>explored</em>, <em>studied</em>, <em>archived</em>,
        <em> documented</em>, <em>mapped</em>, <em>researched</em>. small words
        with very different posture.
      </P>

      <H2>atlas as archive</H2>
      <P>
        wandery is a quiet object. it is meant to be opened on a long evening,
        zoomed slowly, scrubbed gently through decades. it is closer to a museum
        room than a dashboard.
      </P>

      <Rule />
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        wandery · vol. i · ongoing
      </p>
    </Shell>
  );
}