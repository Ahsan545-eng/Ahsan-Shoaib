import heroStudioImg from '../assets/images/hero_design_code_studio_1794743272203.jpg';
import zenithBrandImg from '../assets/images/work/zenith_brand_3d.jpg';
import zenithLetterheadImg from '../assets/images/work/zenith_letterhead_3d.jpg';
import visionSoundImg from '../assets/images/work/vision_sound_mockup.jpg';
import visionSoundFlyerImg from '../assets/images/work/vision_sound_flyer.jpg';
import archInteriorImg from '../assets/images/work/arch_interior_living.jpg';
import archExteriorImg from '../assets/images/work/arch_exterior_render.jpg';
import archHouseImg from '../assets/images/work/arch_house_render.jpg';
import archReceptionImg from '../assets/images/work/arch_office_reception.jpg';
import floorPlanImg from '../assets/images/work/floor_plan_3d.jpg';
import furnitureDeskImg from '../assets/images/work/furniture_computer_table_3d.jpg';
import furnitureWardrobeImg from '../assets/images/work/furniture_wardrobe_3d.jpg';
import photoEditMessiImg from '../assets/images/work/photo_edit_messi.jpg';

export type ProjectCategory = 'all' | 'brand' | 'architecture' | 'furniture';

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<ProjectCategory, 'all'>;
  categoryLabel: string;
  year: string;
  client: string;
  role: string;
  layoutSpan: 'wide' | 'compact';
  imagePosition?: 'center' | 'top';
  imageSrc: string;
  imageAlt: string;
  driveUrl: string;
  summary: string;
  outcomeMetric: string;
  deliverables: string[];
  codeSnippetTitle: string;
  codeSnippet: string;
}

export interface VideoWorkItem {
  id: string;
  fileId: string;
  title: string;
  category: string;
  durationNote: string;
  description: string;
  tools: string;
  driveUrl: string;
  previewUrl: string;
}

export interface WritingItem {
  id: string;
  year: string;
  topic: string;
  title: string;
  readTime: string;
  excerpt: string;
  paragraphs: string[];
  codeTitle: string;
  codeBlock: string;
}

export const DRIVE_PORTFOLIO_URL =
  'https://drive.google.com/drive/folders/1HrAh8slYgzfd8WJyLlJkzkFzgwlc0WV8?usp=drive_link';

export const RESUME_PDF_URL = '/Ahsan_Shoaib_Resume.pdf';

export const HERO_IMAGE = {
  src: heroStudioImg,
  alt: 'Minimalist graphic design and programming workstation featuring 3D wireframe architecture alongside C++ and Python code',
};

export const KPI_METRICS = [
  { value: '6 Fields', label: 'Branding, 3D, Video & Code' },
  { value: '40+ Works', label: 'Renders, Mockups & Video Edits' },
  { value: 'C++ & Python', label: 'Microsoft & UMich Certified' },
  { value: 'Karachi, PK', label: 'Available Worldwide Remote' },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'zenith-clothing-brand',
    title: 'Zenith Clothing Brand Identity',
    subtitle: 'Deep forest & metallic gold monogram system with 3D-rendered stationery collateral.',
    category: 'brand',
    categoryLabel: 'Brand & Photo',
    year: '2025',
    client: 'Zenith Apparel, Karachi',
    role: 'Brand Designer & 3D Mockup Artist',
    layoutSpan: 'wide',
    imageSrc: zenithBrandImg,
    imageAlt: 'Zenith Clothing Brand 3D rendered dark green and gold foil business card mockup',
    driveUrl: 'https://drive.google.com/drive/folders/1I3m3dW4_Cmw7Wrh0t-cddSHOkYRHA0UH',
    summary:
      'Complete corporate and retail stationery identity for Zenith Apparel. Crafted an angular interlocking Z geometric mark paired with serif wordmark typography, metallic gold accents, and custom 3D-rendered business cards and letterheads.',
    outcomeMetric: 'Complete print & 3D stationery package delivered for commercial rollout',
    deliverables: ['Geometric Z Monogram', '3D Render Business Cards', '3D Render Letterhead', 'Print-Ready Vector Files'],
    codeSnippetTitle: 'Brand Color & Typography Tokens',
    codeSnippet: `export const zenithTokens = {
  surfacePrimary: "#152E28",
  foilGold: "#C8A651",
  inkIvory: "#F4F1E8",
  typography: {
    display: "Playfair Display",
    body: "Plus Jakarta Sans",
  },
};`,
  },
  {
    id: 'vision-sound-electronics',
    title: 'Vision Sound Brochure & Collateral',
    subtitle: 'Tri-fold commercial brochure, folders, envelopes, and corporate cards.',
    category: 'brand',
    categoryLabel: 'Brand & Photo',
    year: '2025',
    client: 'Vision Sound Electronics',
    role: 'Graphic & Collateral Designer',
    layoutSpan: 'compact',
    imageSrc: visionSoundImg,
    imageAlt: 'Vision Sound Electronic Brand tri-fold brochure mockup on two-tone surface',
    driveUrl: 'https://drive.google.com/drive/folders/14rJrVD-ZfpcDcp9MvAUEap5LEHNDJ-5Z',
    summary:
      'End-to-end graphic identity and print marketing suite for an audio-visual electronics brand. Designed multi-panel brochures, promotional flyers, corporate folders, envelopes, color palette sheets, and precise print-dimension specs.',
    outcomeMetric: '15+ print & mockup assets delivered across brochure, flyer & folder lines',
    deliverables: ['Tri-Fold Brochures', 'Corporate Folder & Envelope', 'Business Cards', 'Color Palette & Dimensions'],
    codeSnippetTitle: 'Print Grid & Bleed Specification (CSS Paged)',
    codeSnippet: `@page brochure-panel {
  size: 297mm 210mm;
  margin: 12mm;
  bleed: 3mm;
  marks: crop cross;
}`,
  },
  {
    id: 'modern-villa-exterior',
    title: 'Modern Villa Residence Exterior',
    subtitle: 'Single-family contemporary exterior 3D render with stone cladding and terrace.',
    category: 'architecture',
    categoryLabel: '3D & Architecture',
    year: '2025',
    client: 'Residential Architecture Series',
    role: '3D Exterior Visualizer',
    layoutSpan: 'compact',
    imageSrc: archHouseImg,
    imageAlt: '3D architectural exterior render of a modern single-family residence with stone wall and car porch',
    driveUrl: 'https://drive.google.com/drive/folders/1UkZuYQvLhvKxW7ryx0FqpqmZmlfhNnOe',
    summary:
      'Photorealistic daylight architectural exterior visualization featuring stacked slate stone cladding, cantilevered porch framing, glass terrace balustrades, and natural foliage framing.',
    outcomeMetric: 'Part of a 7-variation residential exterior visualization series',
    deliverables: ['Exterior Massing & Facade', 'Stone & Timber Texturing', 'Daylight Sky & Reflections', 'Landscape Framing'],
    codeSnippetTitle: 'Sun Elevation Vector (Three.js)',
    codeSnippet: `const sunLight = new THREE.DirectionalLight(0xfff6e5, 2.6);
sunLight.position.set(18, 28, 14);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);`,
  },
  {
    id: 'modern-living-interior',
    title: 'Contemporary Living Room Visualization',
    subtitle: 'Photorealistic 3D interior lighting, marble detailing, and custom ceiling geometry.',
    category: 'architecture',
    categoryLabel: '3D & Architecture',
    year: '2025',
    client: 'Interior Visualization Series',
    role: '3D Architectural Visualizer',
    layoutSpan: 'wide',
    imageSrc: archInteriorImg,
    imageAlt: 'Photorealistic 3D living room interior render with warm recessed lighting and modern chandelier',
    driveUrl: 'https://drive.google.com/drive/folders/1GrkSYd3IYy_x2IgaPFIgL7h4rogd8MNt',
    summary:
      'High-detail interior visualization blending warm indirect cove lighting, fluted acoustic wall paneling, honed marble surfaces, and custom circular suspension lighting.',
    outcomeMetric: '10+ interior visualizations spanning living rooms, kitchens, baths & offices',
    deliverables: ['3D Interior Lighting', 'Material & Shader Setup', 'Custom Furniture Placement', 'Architectural Detailing'],
    codeSnippetTitle: 'Physically-Based Area Light Rig',
    codeSnippet: `const coveLight = new THREE.RectAreaLight(0xffe4b5, 3.2, 4.5, 0.25);
coveLight.position.set(0, 2.85, -1.2);
coveLight.lookAt(0, 0, 0);
scene.add(coveLight);`,
  },
  {
    id: 'commercial-floor-plan',
    title: '3D Commercial Office Floor Plan',
    subtitle: 'Full-floor 3ds Max cutaway showing workstations, boardroom, reception & lounge.',
    category: 'architecture',
    categoryLabel: '3D & Architecture',
    year: '2025',
    client: 'Commercial Spatial Planning',
    role: '3D CAD & Spatial Modeler',
    layoutSpan: 'wide',
    imageSrc: floorPlanImg,
    imageAlt: 'Isometric 3D cutaway floor plan render of a commercial office with boardroom, desks, and reception',
    driveUrl: 'https://drive.google.com/drive/folders/1lBZ2QSCwxSLyKsCaaaSzA5vTELznRzlt',
    summary:
      'Detailed isometric 3D cutaway floor plan modeled in 3ds Max illustrating circulation paths across reception, conference boardroom, open workstations, executive offices, and break areas.',
    outcomeMetric: 'Delivered alongside 2D CAD floor plans & 3 additional 3D floor layouts',
    deliverables: ['2D Architectural Drafting', '3D Isometric Cutaway', 'Furniture & Zoning Layout', '3ds Max Studio Render'],
    codeSnippetTitle: 'Spatial Grid Coordinate Helper (Python)',
    codeSnippet: `def grid_zone(width_m: float, depth_m: float, module: float = 1.2):
    cols = int(width_m // module)
    rows = int(depth_m // module)
    return {"columns": cols, "rows": rows, "workstations": cols * rows}`,
  },
  {
    id: 'exhibition-reception-kiosk',
    title: 'Corporate Exhibition & Reception Kiosk',
    subtitle: 'Architectural wooden pergola booth with illuminated signage and display wall.',
    category: 'architecture',
    categoryLabel: '3D & Architecture',
    year: '2025',
    client: 'Commercial Interior Study',
    role: '3D Spatial & Booth Designer',
    layoutSpan: 'compact',
    imageSrc: archReceptionImg,
    imageAlt: '3D studio render of a corporate exhibition booth and reception lounge with wood slats',
    driveUrl: 'https://drive.google.com/drive/folders/1GrkSYd3IYy_x2IgaPFIgL7h4rogd8MNt',
    summary:
      'Bespoke corporate exhibition booth and reception environment combining warm timber louvers, backlit display signage, lounge seating, and integrated glass reception counter.',
    outcomeMetric: 'Turnkey 3D spatial concept for trade exhibitions and office lobbies',
    deliverables: ['3D Exhibition Booth Model', 'Backlit Signage Design', 'Timber Pergola Detailing', 'Studio Lighting Pass'],
    codeSnippetTitle: 'Exhibition Booth Module Dimensions',
    codeSnippet: `struct BoothModule {
  float widthMeters = 6.0f;
  float depthMeters = 4.0f;
  float ceilingHeight = 3.2f;
  int backlitFrames = 3;
};`,
  },
  {
    id: 'multi-tower-exterior',
    title: 'Multi-Tower Residential Complex',
    subtitle: 'High-rise architectural exterior 3D render with daylight modulation.',
    category: 'architecture',
    categoryLabel: '3D & Architecture',
    year: '2025',
    client: 'High-Rise Development Study',
    role: '3D Exterior Artist',
    layoutSpan: 'compact',
    imageSrc: archExteriorImg,
    imageAlt: '3D architectural exterior render of multi-tower modern residential apartments',
    driveUrl: 'https://drive.google.com/drive/folders/1UkZuYQvLhvKxW7ryx0FqpqmZmlfhNnOe',
    summary:
      'Full-scale architectural exterior visualization showcasing repetitive window-bay geometry, recessed balcony shadows, crisp facade glazing, and streetscape landscaping.',
    outcomeMetric: 'Perspective HD multi-tower visualization render',
    deliverables: ['High-Rise Facade Modeling', 'Daylight Sky Pass', 'Foliage Composition', 'Perspective HD Render'],
    codeSnippetTitle: 'Parametric Tower Bay Generator',
    codeSnippet: `function generateTowerBays(floors: number, bays: number) {
  return Array.from({ length: floors }, (_, f) =>
    Array.from({ length: bays }, (_, b) => ({ floor: f, bay: b }))
  );
}`,
  },
  {
    id: 'vision-sound-flyers',
    title: 'Vision Sound Promotional Flyers',
    subtitle: 'High-impact print & promotional campaign layouts with QR integration.',
    category: 'brand',
    categoryLabel: 'Brand & Photo',
    year: '2025',
    client: 'Vision Sound Electronics',
    role: 'Print & Campaign Designer',
    layoutSpan: 'compact',
    imageSrc: visionSoundFlyerImg,
    imageAlt: 'Vision Sound promotional dual flyer mockup featuring TV and soundbar campaign',
    driveUrl: 'https://drive.google.com/drive/folders/14rJrVD-ZfpcDcp9MvAUEap5LEHNDJ-5Z',
    summary:
      'Dual-sided promotional flyer system showcasing 4K UHD TVs and soundbars with dynamic diagonal geometric composition, clean hierarchy, and scannable QR call-to-actions.',
    outcomeMetric: 'Front & back print flyers prepared for retail distribution',
    deliverables: ['Dual-Sided Flyer Design', 'Product Cutouts & Retouching', 'QR Code Print Integration', 'Realistic Mockup'],
    codeSnippetTitle: 'Diagonal Layout Clip Path (CSS)',
    codeSnippet: `.flyer-diagonal-band {
  clip-path: polygon(0 0, 100% 18%, 100% 100%, 0 82%);
  background: linear-gradient(135deg, #273b7a, #1d5d7a);
}`,
  },
  {
    id: 'zenith-letterhead-suite',
    title: 'Zenith Brand Letterhead 3D Mockup',
    subtitle: 'Executive dark-emerald and gold stationery presentation.',
    category: 'brand',
    categoryLabel: 'Brand & Photo',
    year: '2025',
    client: 'Zenith Apparel, Karachi',
    role: 'Brand & Print Designer',
    layoutSpan: 'compact',
    imageSrc: zenithLetterheadImg,
    imageAlt: 'Zenith Clothing Brand 3D rendered letterhead stationery sheet on stone desk',
    driveUrl: 'https://drive.google.com/drive/folders/1I3m3dW4_Cmw7Wrh0t-cddSHOkYRHA0UH',
    summary:
      'Executive A4 letterhead design extending the Zenith geometric identity into clean document grids, subtle watermark framing, and metallic gold footer rules.',
    outcomeMetric: 'Unified stationery suite matching business card foil specifications',
    deliverables: ['A4 Letterhead Layout', '3D Perspective Mockup', 'Typography Hierarchy', 'Print Specs'],
    codeSnippetTitle: 'A4 Print Margin Grid',
    codeSnippet: `@page letterhead {
  size: A4 portrait;
  margin: 24mm 20mm 22mm 20mm;
}`,
  },
  {
    id: 'modular-computer-desk',
    title: 'Modular Computer & Storage Desk',
    subtitle: '3D product & furniture modeling with brushed steel hardware and birch laminate.',
    category: 'furniture',
    categoryLabel: '3D Furniture',
    year: '2025',
    client: 'Furniture Product Series',
    role: '3D Product Modeler',
    layoutSpan: 'compact',
    imageSrc: furnitureDeskImg,
    imageAlt: '3D studio render of a modern light wood storage desk with three drawers and open shelving',
    driveUrl: 'https://drive.google.com/drive/folders/1Tg63rGgdTQ1fVhsRPPTT_wr46upVVQRC',
    summary:
      'Clean studio product visualization of a multi-compartment storage desk with chamfered wood-grain panels, brushed aluminum drawer pulls, and soft studio shadow falloff.',
    outcomeMetric: 'Part of 6-piece 3D furniture catalog (tables, chairs, bench & wardrobe)',
    deliverables: ['3D Hard-Surface Modeling', 'Wood Grain UV Mapping', 'Brushed Metal Shaders', 'Studio Lighting'],
    codeSnippetTitle: 'Procedural Shelf Builder (Python)',
    codeSnippet: `def furniture_bounds(w_cm: int, h_cm: int, d_cm: int, drawers: int = 3):
    drawer_height = round((h_cm - 6) / drawers, 1)
    return {"width": w_cm, "depth": d_cm, "drawerHeightCm": drawer_height}`,
  },
  {
    id: 'timber-wardrobe-3d',
    title: 'Vertical Timber Storage Wardrobe',
    subtitle: '3D architectural joinery render with vertical grain alignment and shelving.',
    category: 'furniture',
    categoryLabel: '3D Furniture',
    year: '2025',
    client: 'Furniture Product Series',
    role: '3D Furniture Modeler',
    layoutSpan: 'compact',
    imageSrc: furnitureWardrobeImg,
    imageAlt: '3D render of a tall natural wood shelving wardrobe unit on clean studio background',
    driveUrl: 'https://drive.google.com/drive/folders/1Tg63rGgdTQ1fVhsRPPTT_wr46upVVQRC',
    summary:
      'Precision 3D furniture model demonstrating clean vertical wood-grain UV alignment, evenly spaced shelving bays, and studio product photography lighting.',
    outcomeMetric: 'Production-ready 3D interior asset for architectural staging',
    deliverables: ['Joinery 3D Modeling', 'UV Grain Alignment', 'Softbox Studio Render', 'Catalog Asset'],
    codeSnippetTitle: 'Shelf Bay Spacing Spec',
    codeSnippet: `const shelfOffsetsMm = [40, 420, 800, 1180, 1560, 1940];`,
  },
  {
    id: 'messi-portrait-composite',
    title: 'Portrait Composite & Color Matching',
    subtitle: 'Seamless multi-subject Photoshop compositing, shadow casting, and foliage grading.',
    category: 'brand',
    categoryLabel: 'Brand & Photo',
    year: '2025',
    client: 'Photo Editing & Retouching',
    role: 'Photo Manipulation Artist',
    layoutSpan: 'compact',
    imagePosition: 'top',
    imageSrc: photoEditMessiImg,
    imageAlt: 'Photo manipulation composite matching lighting, shadows, and color grading in an autumn avenue',
    driveUrl: 'https://drive.google.com/drive/folders/16tntKsIDXWBOGiborBdiDVysxrUERhsN',
    summary:
      'Advanced Photoshop compositing and retouching matching perspective scale, ground contact shadows, jersey tones, and warm autumn environmental light across subjects.',
    outcomeMetric: 'Precision masking, color harmony & realistic ground shadow synthesis',
    deliverables: ['Subject Extraction & Masking', 'Ambient Color Matching', 'Contact Shadow Painting', 'Final Tone Grading'],
    codeSnippetTitle: 'Color Grading Curve Preset',
    codeSnippet: `filter: contrast(1.06) saturate(1.12) sepia(0.08);`,
  },
];

export const VIDEO_WORKS: VideoWorkItem[] = [
  {
    id: 'ford-vs-ferrari',
    fileId: '10CbCXt4QcVBtp8TDxyl8FyXdLf7xK-u_',
    title: 'Ford vs Ferrari — Rhythm & Sound Cut',
    category: 'Automotive Tribute Edit',
    durationNote: 'HD Video Edit',
    description:
      'High-tempo cinematic montage built around engine transients, rhythmic pacing cuts, and dramatic color contrast.',
    tools: 'Premiere Pro · Sound Design · Color Grading',
    driveUrl: 'https://drive.google.com/file/d/10CbCXt4QcVBtp8TDxyl8FyXdLf7xK-u_/view?usp=drive_link',
    previewUrl: 'https://drive.google.com/file/d/10CbCXt4QcVBtp8TDxyl8FyXdLf7xK-u_/preview',
  },
  {
    id: 'cookverse-channel',
    fileId: '1ANOBftoa6Bk0O-E2qX0JlwrfchsOcV8v',
    title: 'CookVerse — Culinary Channel Production',
    category: 'YouTube & Brand Video',
    durationNote: '2-Part Series',
    description:
      'Clean food-channel pacing with crisp transitions, motion lower-thirds, and warm culinary color grading.',
    tools: 'Premiere Pro · After Effects · Motion Titles',
    driveUrl: 'https://drive.google.com/file/d/1ANOBftoa6Bk0O-E2qX0JlwrfchsOcV8v/view?usp=drive_link',
    previewUrl: 'https://drive.google.com/file/d/1ANOBftoa6Bk0O-E2qX0JlwrfchsOcV8v/preview',
  },
  {
    id: 'arena-multimedia-shoot',
    fileId: '1aIPwVgqEzwM1yAGEAbYhJRz5Qype1FGi',
    title: 'Arena Multimedia — Studio Shoot Reel',
    category: 'Commercial Documentary',
    durationNote: 'Campus Production',
    description:
      'On-location production edit capturing creative studio workflows, b-roll sequences, and crisp audio sync.',
    tools: 'Premiere Pro · Multi-Clip Sync · Color Pass',
    driveUrl: 'https://drive.google.com/file/d/1aIPwVgqEzwM1yAGEAbYhJRz5Qype1FGi/view?usp=drive_link',
    previewUrl: 'https://drive.google.com/file/d/1aIPwVgqEzwM1yAGEAbYhJRz5Qype1FGi/preview',
  },
  {
    id: 'messi-ronaldo-edit',
    fileId: '1J2wvHqzPn5wWOdxlzXlbkEHZPjO6bqwc',
    title: 'Messi & Ronaldo — Velocity Sports Edit',
    category: 'Sports Motion Edit',
    durationNote: 'Dynamic Cut',
    description:
      'Beat-synced velocity edit combining speed ramps, impact shakes, and broadcast match footage.',
    tools: 'Premiere Pro · Speed Ramping · Audio Sync',
    driveUrl: 'https://drive.google.com/file/d/1J2wvHqzPn5wWOdxlzXlbkEHZPjO6bqwc/view?usp=drive_link',
    previewUrl: 'https://drive.google.com/file/d/1J2wvHqzPn5wWOdxlzXlbkEHZPjO6bqwc/preview',
  },
];

export const ARCHIVE_COLLECTIONS = [
  {
    title: 'Microsoft C++ Specialization',
    detail: 'Verified Course & Specialization Certificates on Drive',
    href: 'https://drive.google.com/drive/folders/1xiy9ypxbz6JHN1wyg7AQbLy1HM7xTRsy',
  },
  {
    title: 'UMich Python Specialization',
    detail: 'University of Michigan Python Programming Certificates',
    href: 'https://drive.google.com/drive/folders/1GKswr5LgVaLC4i1bmPiyIDNvAz3lJQXK',
  },
  {
    title: '3D Architecturing & Furniture',
    detail: '10 Exteriors · 10 Interiors · 5 Floor Plans · 6 Furniture Models',
    href: 'https://drive.google.com/drive/folders/11mBGjR5SXWGRF8X6sozJsBQlb7B-O8Gp',
  },
  {
    title: 'Academic Degrees & Marksheets',
    detail: 'School & College Certificates and Official Transcripts',
    href: 'https://drive.google.com/drive/folders/1eX7XrC23ssjgJtj7XQVE7epQLjEqp4kC',
  },
];

export const WRITING_NOTES: WritingItem[] = [
  {
    id: 'swiss-grids-css-subgrid',
    year: '2026',
    topic: 'Systems & Layout',
    title: 'From Architectural Floor Plans to CSS Grid Systems',
    readTime: '5 min read',
    excerpt:
      'How structural 2D/3D architectural proportions translate cleanly to modular web layouts with CSS subgrid.',
    paragraphs: [
      'Drafting a residential floor plan and architecting a responsive web layout share the same foundational constraint: every column, hallway, and gutter must align across levels before surface materials are applied.',
      'By defining a single root column track and propagating it into nested interface cards with grid-template-columns: subgrid, headlines, visual plates, and metadata lock onto identical vertical axes.',
      'Paired with tabular numerals for dimensions and fluid clamp() type scales, digital layouts carry the same physical discipline as architectural drafting.',
    ],
    codeTitle: 'Shared Root Editorial Grid',
    codeBlock: `.editorial-canvas {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: clamp(1rem, 2vw, 2rem);
}

.editorial-card {
  grid-column: span 6;
  display: grid;
  grid-template-columns: subgrid;
}`,
  },
  {
    id: 'cpp-python-creative-tools',
    year: '2025',
    topic: 'Programming',
    title: 'Bridging C++ & Python Foundations with Interactive Web Graphics',
    readTime: '6 min read',
    excerpt:
      'Applying structured programming principles from C++ and Python to deterministic generative SVG and Canvas art.',
    paragraphs: [
      'Visual tools feel most dependable when the code underneath them is clean and predictable. Strong foundations in C++ memory logic and Python algorithmic scripting make front-end creative coding effortless.',
      'Instead of randomizing shapes chaotically, deterministic seed functions let designers explore repeatable grid variations—rotating Bauhaus arcs, scaling dot matrices, and exporting exact CSS tokens in one click.',
      'Combining engineering rigor with graphic intuition removes the friction between mockup and shipped product.',
    ],
    codeTitle: 'Deterministic Grid Seed Function',
    codeBlock: `function computeCellState(row: number, col: number, seed: number) {
  const rotation = ((row * 3 + col * 2 + seed) % 4) * 90;
  const isGoldAccent = (row + col + seed) % 5 === 0;
  return { rotation, isGoldAccent };
}`,
  },
  {
    id: 'lighting-materials-ui',
    year: '2025',
    topic: '3D & Visual Craft',
    title: 'Translating 3D Interior Lighting Depth into Dark UI Surfaces',
    readTime: '4 min read',
    excerpt:
      'What architectural cove lighting and metallic foil mockups teach us about contrast on dark purple-obsidian interfaces.',
    paragraphs: [
      'In 3D rendering, flat black swallows form and makes spaces feel lifeless. Real depth comes from subtle tonal separation between recessed surfaces, warm accent lighting, and crisp specular highlights.',
      'The same rule applies to dark digital interfaces: pairing deep plum-obsidian canvases with translucent layered cards and restrained gold focal accents creates hierarchy without blinding glare.',
      'Treating light, borders, and typography with the care of a 3D lighting pass makes every screen feel deliberate.',
    ],
    codeTitle: 'Layered Plum Surface Tokens',
    codeBlock: `:root {
  --canvas-plum: #130A24;
  --surface-glass: rgba(20, 11, 38, 0.88);
  --border-amethyst: rgba(63, 45, 99, 0.8);
  --accent-gold: #D4AF37;
}`,
  },
];

export const CAPABILITIES = [
  {
    number: '01.',
    title: 'Graphic Design, 3D & Video',
    description:
      'Commercial brand identities, print collateral suites, photo manipulation, 3D architecture/furniture modeling, and narrative video editing.',
    items: [
      'Brand Identity, Logos & Stationery Mockups',
      'Print Collateral (Brochures, Flyers, Letterheads)',
      '3D Architectural Exteriors, Interiors & Floor Plans',
      'Commercial & Cinematic Video Editing',
    ],
  },
  {
    number: '02.',
    title: 'Programming & Interactive Systems',
    description:
      'Certified programming foundations in C++ and Python paired with modern TypeScript, React, and generative browser graphics.',
    items: [
      'C++ Programming (Microsoft Specialization Certified)',
      'Python Programming (University of Michigan Certified)',
      'Interactive React & TypeScript Web Applications',
      'Parametric SVG, Canvas & 3D Web Visualizations',
    ],
  },
];
