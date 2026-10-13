// ─────────────────────────────────────────────────────────────
//  Your portfolio content lives here.
//  To add a project: copy one { ... } block, change the fields,
//  drop the STL into /models and the sheet PNGs/PDF into /drawings.
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: "San Luis Obispo Technical Drafting",
  short: "SLOTD",
  tagline: "Sketches, samples, and old prints turned into clean 3D models and machinist-ready drawings for machine shops and hardware teams across the country.",
  location: "San Luis Obispo, CA",
  email: "drew@drewarneycad.com",
  phone: "(925) 330-4207",    // ← leave "" to hide it
  hours: "Mon–Sat",
};

// Gallery is empty for now. When a project is cleared to show, add it like this:
//
//  {
//    title: "Part Name",
//    dwg: "1234", date: "Jan 2027", material: "6061-T6 Aluminum", standard: "ASME Y14.5-2018",
//    summary: "One or two sentences about the part.",
//    highlights: ["Key feature", "Key tolerance"],
//    model: ["models/part-1.stl"],          // STL file(s) in /models
//    pdf: "drawings/part.pdf",              // optional
//    sheets: [{ src: "drawings/part-sheet-1.png", label: "Sheet 1" }],
//  },
export const PROJECTS = [];

export const SERVICES = [
  {
    title: "3D Modeling",
    body: "Parts and assemblies built in Fusion (or your CAD system) from sketches, old prints, or a physical sample you send over.",
  },
  {
    title: "Production Drawings",
    body: "Machinist-ready drawings with clean views, a sensible datum scheme, and GD&T per ASME Y14.5.",
  },
  {
    title: "Drawing Cleanup & Redraws",
    body: "Legacy or hand-drawn prints converted into modern CAD with consistent title blocks and revision control.",
  },
  {
    title: "Design for Manufacturing",
    body: "A second set of eyes on tool access, internal radii, tolerance stack-ups, and features that drive cost.",
  },
];
