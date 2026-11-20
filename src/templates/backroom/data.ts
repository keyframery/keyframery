/* Backroom's sample store: Tideline Prints, a small shop selling photographic prints.

   Everything here is generated once, from a fixed seed, so the server and the browser build the
   same store and every number agrees with every other: an order's total is its lines plus
   shipping less its discount, a customer's lifetime value is the sum of their orders, and the
   dashboard's revenue is the sum of the orders in the period it shows. Money is in cents.

   Replace this file with your own data source. The types are what the pages read; the generator
   below them is only there so the template has a believable store to show. */

/* ------------------------------------------------------------------ types */

export type Cents = number

/** "2026-11-19T14:30:00.000Z". Always UTC, so server and browser agree. */
export type Iso = string

export type Channel = "online" | "wholesale" | "marketplace"
export type PaymentStatus = "paid" | "pending" | "partially_refunded" | "refunded" | "voided"
export type FulfilmentStatus = "unfulfilled" | "fulfilled"
export type OrderStatus = "open" | "cancelled"

export type Size = "30×40" | "50×70" | "70×100"
export type Finish = "Unframed" | "Oak frame" | "Black frame"
export type Collection = "Coast" | "Walks" | "Places" | "Kitchen"
export type ProductStatus = "active" | "draft" | "archived"

export type Variant = {
  id: string
  productId: string
  size: Size
  finish: Finish
  sku: string
  price: Cents
  stock: number
}

export type Product = {
  id: string
  /** The address of the product's page in the shop, like "the-jetty". */
  handle: string
  name: string
  collection: Collection
  /** "/demo/lake.jpg" */
  photo: string
  description: string
  status: ProductStatus
  createdAt: Iso
  variants: Variant[]
}

export type Address = { line1: string; city: string; postcode: string; country: string }

export type Customer = {
  id: string
  name: string
  email: string
  phone?: string
  /** A photo, for the few customers who have one. Others show their initials. */
  avatar?: string
  /** A shop or gallery that buys wholesale. */
  company?: string
  address: Address
  createdAt: Iso
  tags: string[]
  note: string
  marketing: boolean
}

export type OrderLine = {
  productId: string
  variantId: string
  name: string
  /** "50×70 · Oak frame" */
  variantTitle: string
  photo: string
  quantity: number
  /** Per unit, after any wholesale price. */
  price: Cents
}

export type OrderEventKind = "placed" | "paid" | "fulfilled" | "delivered" | "refunded" | "cancelled" | "note" | "invoice"

export type OrderEvent = { id: string; at: Iso; kind: OrderEventKind; text: string; by?: string }

export type Order = {
  /** The order number people say: 1042. Its page is /orders/1042. */
  number: number
  customerId: string
  createdAt: Iso
  channel: Channel
  lines: OrderLine[]
  subtotal: Cents
  discount: Cents
  discountCode?: string
  shipping: Cents
  shippingMethod: string
  /** VAT included in the total (23%), for the receipt. */
  tax: Cents
  total: Cents
  /** How much has been refunded so far. */
  refunded: Cents
  payment: PaymentStatus
  fulfilment: FulfilmentStatus
  status: OrderStatus
  tracking?: { carrier: string; number: string }
  address: Address
  events: OrderEvent[]
}

export type Role = "owner" | "admin" | "staff" | "viewer"

export type Member = {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  title: string
  status: "active" | "invited"
  lastActive: Iso
}

export type NotificationKind = "order" | "stock" | "refund" | "payout" | "team" | "review"

export type Notification = {
  id: string
  at: Iso
  kind: NotificationKind
  title: string
  body: string
  /** Where it leads, as a path inside the admin: "/orders/1478". */
  to?: string
  read: boolean
}

export type Workspace = { id: string; name: string; plan: string; shortcut: string }

export type StoreSettings = {
  name: string
  legalName: string
  email: string
  phone: string
  address: Address
  currency: "EUR"
  timezone: string
  vatNumber: string
  orderPrefix: string
  notifications: { newOrder: boolean; lowStock: boolean; refunds: boolean; weeklySummary: boolean }
  lowStockAt: number
}

export type Plan = {
  name: string
  price: Cents
  renews: Iso
  usage: { label: string; used: number; limit: number; unit?: string }[]
}

export type Invoice = { id: string; date: Iso; amount: Cents; status: "paid" | "due" }

/** One day of the shop's own traffic, which the orders don't hold. */
export type TrafficDay = {
  date: Iso
  sessions: number
  addedToCart: number
  reachedCheckout: number
  sources: Record<Source, number>
  devices: Record<Device, number>
}

export type Source = "search" | "instagram" | "direct" | "pinterest" | "newsletter" | "other"
export type Device = "mobile" | "desktop" | "tablet"

/* ------------------------------------------------------------------ the calendar */

/** Today, for the whole template: 19 Nov 2026, mid-afternoon. */
export const NOW = Date.UTC(2026, 10, 19, 14, 30)
const DAY = 86_400_000
/** The first day with orders. 182 days, so a 90-day period has a full 90 days to compare with. */
export const HISTORY_DAYS = 182
/** Midnight (UTC) at the start of today. */
export const TODAY = Date.UTC(2026, 10, 19)

export const iso = (ms: number): Iso => new Date(ms).toISOString()

/* ------------------------------------------------------------------ a seeded generator */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(19_11_2026)
const between = (min: number, max: number) => min + rand() * (max - min)
const int = (min: number, max: number) => Math.floor(between(min, max + 1))
const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]
function weighted<T>(list: readonly (readonly [T, number])[]): T {
  const total = list.reduce((sum, [, w]) => sum + w, 0)
  let r = rand() * total
  for (const [value, w] of list) {
    r -= w
    if (r <= 0) return value
  }
  return list[list.length - 1][0]
}

/* ------------------------------------------------------------------ products */

const SIZES: Size[] = ["30×40", "50×70", "70×100"]
const FINISHES: Finish[] = ["Unframed", "Oak frame", "Black frame"]
const PRINT_PRICE: Record<Size, Cents> = { "30×40": 4500, "50×70": 8500, "70×100": 14500 }
const FRAME_PRICE: Record<Size, Cents> = { "30×40": 5500, "50×70": 8500, "70×100": 12500 }

/** Each print: its photo, name, collection, a line of description and how well it sells. Most come in every
    size and frame. The still lifes stop at 50×70, two small studies are 30×40 only, and two prints are made
    in one frame, so the shop's list reads like a shop's and not like a grid. */
const PRINTS: { file: string; name: string; collection: Collection; description: string; weight: number; sizes?: Size[]; finishes?: Finish[] }[] = [
  { file: "lake", name: "The jetty", collection: "Places", description: "Boards running out over still green water, pine on both shores and the peaks behind.", weight: 10 },
  { file: "coast-5", name: "Pebble shore", collection: "Coast", description: "A long curve of grey pebbles, a fallen pine and pale water to the horizon.", weight: 9 },
  { file: "canal", name: "Canal houses", collection: "Places", description: "Painted houses leaning over a canal, boats tied up below the windows.", weight: 8 },
  { file: "coast-1", name: "Western headland", collection: "Coast", description: "Gorse and heather falling to deep blue water, the cliffs going on for miles.", weight: 8 },
  { file: "coast-2", name: "Mountain road", collection: "Coast", description: "A road climbing above a fjord-blue lake, cloud breaking over the ridges.", weight: 6 },
  { file: "walk-17", name: "Orchard path", collection: "Walks", description: "A gravel path between blossom trees, a dark line of spruce at the end.", weight: 7 },
  { file: "coast-4", name: "Low tide", collection: "Coast", description: "Sea stacks in a gold evening, the water drawn across the rocks.", weight: 5 },
  { file: "coast-3", name: "Bay from the air", collection: "Coast", description: "A turquoise bay seen from above, the town spread along its shore.", weight: 4 },
  { file: "walk-29", name: "High ridge", collection: "Walks", description: "Snow and scree under a high ridge, the valley falling away below.", weight: 4 },
  { file: "walk-28", name: "River valley", collection: "Walks", description: "A river through spring beech woods, rocks bright in the shallows.", weight: 4 },
  { file: "walk-15", name: "Falls in the gorge", collection: "Walks", description: "A thin waterfall into a gorge of grey slate and moss.", weight: 3 },
  { file: "walk-18", name: "Long grass", collection: "Walks", description: "One blade of grass in focus over a meadow in early summer.", weight: 3, finishes: ["Unframed", "Oak frame"] },
  { file: "walk-19", name: "Mossed trunk", collection: "Walks", description: "A fallen trunk in deep moss, looking up into the canopy.", weight: 2, sizes: ["30×40"] },
  { file: "gig", name: "Late set", collection: "Places", description: "A singer and his pianist under one beam of light, in black and white.", weight: 5, finishes: ["Unframed", "Black frame"] },
  { file: "food-1", name: "Flat white", collection: "Kitchen", description: "A flat white and the café's brass bell, receipts on the dark wood.", weight: 5, sizes: ["30×40", "50×70"] },
  { file: "food-2", name: "Raspberries in white", collection: "Kitchen", description: "A white bowl of raspberries on a pale table.", weight: 4, sizes: ["30×40", "50×70"] },
  { file: "food-3", name: "Red onion", collection: "Kitchen", description: "A cut red onion, peppercorns and parsnip on a board.", weight: 3, sizes: ["30×40", "50×70"] },
  { file: "food-4", name: "Harvest grapes", collection: "Kitchen", description: "Black grapes on the vine, just picked, with the leaves still on.", weight: 3, sizes: ["30×40", "50×70"] },
  { file: "food-5", name: "Tea press", collection: "Kitchen", description: "A glass press of green tea, steam on the glass, a cup beside it.", weight: 3, sizes: ["30×40", "50×70"] },
  { file: "food-6", name: "Three raspberries", collection: "Kitchen", description: "Three raspberries on a table in low gold light.", weight: 2, sizes: ["30×40"] },
  { file: "cup", name: "Red table", collection: "Kitchen", description: "A white cup of milky coffee on a red table, seen from above.", weight: 4, sizes: ["30×40", "50×70"] },
]

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

export const products: Product[] = PRINTS.map((print, index) => {
  const id = `p${String(index + 1).padStart(2, "0")}`
  const code = print.file.toUpperCase().replace("-", "")
  return {
    id,
    handle: slugify(print.name),
    name: print.name,
    collection: print.collection,
    photo: `/demo/${print.file}.jpg`,
    description: print.description,
    /* Two prints were added this month and aren't published yet; everything else is on sale. */
    status: index === 19 || index === 20 ? "draft" : "active",
    createdAt: iso(TODAY - (index === 19 || index === 20 ? int(4, 12) : int(200, 640)) * DAY),
    /* Every size and frame draws its stock, then the ones this print isn't sold in are dropped: the draws
       after it (customers, orders) stay the same whatever a print is sold in. */
    variants: SIZES.flatMap((size) =>
      FINISHES.map((finish) => ({
        id: `${id}-${size.replace("×", "x")}-${finish === "Unframed" ? "u" : finish === "Oak frame" ? "o" : "b"}`,
        productId: id,
        size,
        finish,
        sku: `TP-${code}-${size.replace("×", "")}-${finish === "Unframed" ? "U" : finish === "Oak frame" ? "OK" : "BK"}`,
        price: PRINT_PRICE[size] + (finish === "Unframed" ? 0 : FRAME_PRICE[size]),
        /* Prints are made to order; frames are kept in stock, fewer of the big ones. */
        stock: finish === "Unframed" ? int(14, 40) : size === "70×100" ? int(0, 6) : int(2, 14),
      })),
    ).filter((v) => (print.sizes ?? SIZES).includes(v.size) && (print.finishes ?? FINISHES).includes(v.finish)),
  }
})

/** The variant someone asking for this size and frame gets: the nearest size the print is sold in, and
    unframed when it isn't made in that frame. */
const variantOf = (product: Product, size: Size, finish: Finish): Variant => {
  const want = SIZES.indexOf(size)
  const sold = SIZES.filter((s) => product.variants.some((v) => v.size === s))
  const nearest = sold.reduce((best, s) => (Math.abs(SIZES.indexOf(s) - want) < Math.abs(SIZES.indexOf(best) - want) ? s : best))
  const inSize = product.variants.filter((v) => v.size === nearest)
  return inSize.find((v) => v.finish === finish) ?? inSize.find((v) => v.finish === "Unframed") ?? inSize[0]
}

/* A few variants run low or out, so stock warnings have something real to point at. The notifications
   below name two of them. */
variantOf(products[0], "50×70", "Oak frame").stock = 2
variantOf(products[1], "50×70", "Black frame").stock = 0
variantOf(products[2], "30×40", "Oak frame").stock = 2
variantOf(products[3], "70×100", "Black frame").stock = 0

export const productById = new Map(products.map((p) => [p.id, p]))
export const variantTitle = (v: Pick<Variant, "size" | "finish">) => `${v.size} cm · ${v.finish}`

/* ------------------------------------------------------------------ people */

export const workspaces: Workspace[] = [
  { id: "tideline", name: "Tideline Prints", plan: "Growth plan", shortcut: "mod+1" },
  { id: "wholesale", name: "Tideline Wholesale", plan: "Growth plan", shortcut: "mod+2" },
  { id: "sandbox", name: "Sandbox", plan: "Test store", shortcut: "mod+3" },
]

export const team: Member[] = [
  { id: "m1", name: "Niamh Brennan", email: "niamh@tidelineprints.com", role: "owner", avatar: "/demo/face-1.jpg", title: "Founder, photographer", status: "active", lastActive: iso(NOW - 4 * 60_000) },
  { id: "m2", name: "Saoirse Doyle", email: "saoirse@tidelineprints.com", role: "admin", avatar: "/demo/face-3.jpg", title: "Studio and printing", status: "active", lastActive: iso(NOW - 2 * 3_600_000) },
  { id: "m3", name: "Tomás Reilly", email: "tomas@tidelineprints.com", role: "staff", title: "Packing and dispatch", status: "active", lastActive: iso(NOW - 26 * 60_000) },
  { id: "m4", name: "Pieter de Vries", email: "pieter@tidelineprints.com", role: "staff", title: "Wholesale accounts", status: "active", lastActive: iso(NOW - 3 * DAY) },
  { id: "m5", name: "Lena Hoffmann", email: "lena@hoffmann-tax.de", role: "viewer", title: "Accountant", status: "invited", lastActive: iso(NOW - 9 * DAY) },
]

/** The person signed in. */
export const me = team[0]

const FIRST = ["Aoife", "Ciarán", "Maeve", "Darragh", "Clara", "Jonas", "Inès", "Mateo", "Freya", "Luca", "Hanna", "Oisín", "Sofia", "Emil", "Margot", "Rory", "Anouk", "Felix", "Isla", "Tiago", "Elena", "Bram", "Nora", "Hugo", "Ruth", "Kian", "Lotte", "Pablo", "Grace", "Matteo", "Sinéad", "Arne", "Chloé", "Finn", "Beatriz", "Cillian", "Ida", "Louis", "Orla", "Henrik"]
const LAST = ["Murphy", "Kelly", "O'Sullivan", "Walsh", "Moreau", "Becker", "Laurent", "García", "Nielsen", "Romano", "Schmidt", "Byrne", "Costa", "Lindqvist", "Dubois", "Gallagher", "Jansen", "Wagner", "MacLeod", "Ferreira", "Rossi", "Visser", "Kavanagh", "Bernard", "Fischer", "Quinn", "de Jong", "Sánchez", "Power", "Bianchi"]
const PLACES: { city: string; country: string; postcode: () => string; weight: number }[] = [
  { city: "Dublin", country: "Ireland", postcode: () => `D0${int(1, 8)} ${pick(["K2", "X5", "F9", "W6"])}${int(10, 99)}`, weight: 14 },
  { city: "Galway", country: "Ireland", postcode: () => `H91 ${pick(["E2", "K7", "T8"])}${int(10, 99)}`, weight: 8 },
  { city: "Cork", country: "Ireland", postcode: () => `T12 ${pick(["A4", "C9", "W3"])}${int(10, 99)}`, weight: 7 },
  { city: "Belfast", country: "United Kingdom", postcode: () => `BT${int(1, 9)} ${int(1, 9)}${pick(["AB", "HQ", "LN"])}`, weight: 4 },
  { city: "Amsterdam", country: "Netherlands", postcode: () => `10${int(10, 99)} ${pick(["AB", "KL", "TZ"])}`, weight: 6 },
  { city: "Berlin", country: "Germany", postcode: () => `10${int(115, 999)}`, weight: 6 },
  { city: "Hamburg", country: "Germany", postcode: () => `20${int(95, 459)}`, weight: 3 },
  { city: "Paris", country: "France", postcode: () => `750${String(int(1, 20)).padStart(2, "0")}`, weight: 5 },
  { city: "Lyon", country: "France", postcode: () => `6900${int(1, 9)}`, weight: 2 },
  { city: "Copenhagen", country: "Denmark", postcode: () => `${int(1050, 2450)}`, weight: 3 },
  { city: "Lisbon", country: "Portugal", postcode: () => `1${int(100, 990)}-${int(100, 999)}`, weight: 3 },
  { city: "Milan", country: "Italy", postcode: () => `201${String(int(0, 99)).padStart(2, "0")}`, weight: 2 },
  { city: "Antwerp", country: "Belgium", postcode: () => `20${int(0, 99)}`, weight: 2 },
]
const STREETS: Record<string, string[]> = {
  Ireland: ["Harbour Road", "Mill Street", "Quay Lane", "Church Hill", "Strand Road", "Market Square", "Bridge Street"],
  "United Kingdom": ["Lisburn Road", "Botanic Avenue", "Ormeau Road"],
  Netherlands: ["Prinsengracht", "Lindengracht", "Ceintuurbaan"],
  Germany: ["Kastanienallee", "Schillerstraße", "Lindenallee"],
  France: ["Rue des Lilas", "Rue Oberkampf", "Rue de la Charité"],
  Denmark: ["Nørrebrogade", "Istedgade", "Jægersborggade"],
  Portugal: ["Rua da Rosa", "Rua de São Bento"],
  Italy: ["Via Solferino", "Via Tortona"],
  Belgium: ["Kloosterstraat", "Nationalestraat"],
}
const domain = () => pick(["gmail.com", "outlook.com", "proton.me", "icloud.com", "hotmail.com", "posteo.de", "eircom.net"])
const emailOf = (first: string, last: string) =>
  `${first}.${last}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z.]/g, "") + "@" + domain()

function addressAt(place: (typeof PLACES)[number]): Address {
  return { line1: `${int(2, 148)} ${pick(STREETS[place.country] ?? STREETS.Ireland)}`, city: place.city, postcode: place.postcode(), country: place.country }
}

/** Shops and galleries that buy wholesale. */
const STOCKISTS: { company: string; name: string; email: string; city: string }[] = [
  { company: "Salt & Paper", name: "Eimear Collins", email: "orders@saltandpaper.ie", city: "Cork" },
  { company: "Harbour Gallery", name: "Declan Fitzgerald", email: "declan@harbourgallery.ie", city: "Galway" },
  { company: "Kaffee Nord", name: "Mia Krüger", email: "einkauf@kaffeenord.de", city: "Hamburg" },
  { company: "Atelier Lumen", name: "Juliette Blanc", email: "contact@atelierlumen.fr", city: "Lyon" },
  { company: "De Kaart", name: "Sem Bakker", email: "inkoop@dekaart.nl", city: "Amsterdam" },
  { company: "Northlight Books", name: "Ruairí Nolan", email: "ruairi@northlightbooks.ie", city: "Dublin" },
]

const customerList: Customer[] = []
{
  /* Four named regulars with photos and a story, then the rest. */
  const regulars: Omit<Customer, "id" | "createdAt">[] = [
    { name: "Clara Moreau", email: "clara.moreau@proton.me", avatar: "/demo/face-2.jpg", address: { line1: "14 Rue des Lilas", city: "Paris", postcode: "75011", country: "France" }, tags: ["VIP", "Framed"], note: "Prefers oak frames. Buys for her studio and as gifts every December.", marketing: true, phone: "+33 6 12 48 90 31" },
    { name: "Amara Osei", email: "amara@oseisound.com", avatar: "/demo/face-4.jpg", address: { line1: "3 Canal Walk", city: "Dublin", postcode: "D08 X561", country: "Ireland" }, tags: ["VIP", "Music"], note: "Owns a record shop on Francis Street. Asked about a larger print of Late set.", marketing: true, phone: "+353 87 412 0938" },
    { name: "Freya Nielsen", email: "freya.nielsen@icloud.com", address: { line1: "61 Nørrebrogade", city: "Copenhagen", postcode: "2200", country: "Denmark" }, tags: ["Repeat"], note: "", marketing: false },
    { name: "Ciarán Walsh", email: "ciaran.walsh@eircom.net", address: { line1: "9 Quay Lane", city: "Galway", postcode: "H91 K722", country: "Ireland" }, tags: ["Repeat"], note: "Collects at the studio when he can.", marketing: true },
  ]
  for (const r of regulars) customerList.push({ ...r, id: `c${String(customerList.length + 1).padStart(3, "0")}`, createdAt: "" })
  for (const s of STOCKISTS) {
    const place = PLACES.find((p) => p.city === s.city) ?? PLACES[0]
    customerList.push({
      id: `c${String(customerList.length + 1).padStart(3, "0")}`,
      name: s.name,
      email: s.email,
      company: s.company,
      address: addressAt(place),
      createdAt: "",
      tags: ["Wholesale"],
      note: "Net 30 invoice terms. 40% off retail.",
      marketing: false,
    })
  }
  const used = new Set(customerList.map((c) => c.name))
  while (customerList.length < 82) {
    const first = pick(FIRST)
    const last = pick(LAST)
    const name = `${first} ${last}`
    if (used.has(name)) continue
    used.add(name)
    const place = weighted(PLACES.map((p) => [p, p.weight] as const))
    customerList.push({
      id: `c${String(customerList.length + 1).padStart(3, "0")}`,
      name,
      email: emailOf(first, last),
      address: addressAt(place),
      createdAt: "",
      tags: [],
      note: "",
      marketing: rand() < 0.55,
    })
  }
}

const wholesaleIds = customerList.filter((c) => c.company).map((c) => c.id)
const retailIds = customerList.filter((c) => !c.company).map((c) => c.id)
/* Some people come back again and again; most buy once or twice. */
const retailWeights = retailIds.map((id, i) => [id, i < 4 ? 9 : i < 16 ? 3 : 1] as const)

/* ------------------------------------------------------------------ orders */

const productWeights = products.filter((p) => p.status === "active").map((p) => [p, PRINTS[products.indexOf(p)].weight] as const)
const shippingFor = (country: string, subtotal: Cents, channel: Channel): { cost: Cents; method: string } => {
  if (channel === "wholesale") return { cost: 1800, method: "Courier, insured" }
  if (subtotal >= 15000) return { cost: 0, method: country === "Ireland" ? "An Post, tracked (free)" : "DHL Express (free)" }
  return country === "Ireland" ? { cost: 600, method: "An Post, tracked" } : { cost: 1200, method: "DHL Express" }
}
const CARRIERS = { Ireland: "An Post", other: "DHL" }
const STAFF = ["Tomás Reilly", "Saoirse Doyle", "Niamh Brennan"]

const orderList: Order[] = []
{
  let number = 1001
  for (let back = HISTORY_DAYS - 1; back >= 0; back--) {
    const day = TODAY - back * DAY
    const weekday = new Date(day).getUTCDay()
    const age = HISTORY_DAYS - 1 - back
    /* Slow growth, busier Sundays and Mondays, and November picking up toward Christmas. */
    const base = 1.8 + age * 0.0065 + (weekday === 0 || weekday === 1 ? 0.7 : weekday === 5 ? -0.35 : 0) + (back < 20 ? 0.65 : 0)
    const count = Math.max(0, Math.round(base + between(-1.4, 1.4)))
    const times = Array.from({ length: count }, () => int(7 * 60, 23 * 60 + 40)).sort((a, b) => a - b)
    for (const minute of times) {
      const at = day + minute * 60_000
      if (at > NOW - 6 * 60_000) continue
      const channel = weighted<Channel>([["online", 70], ["marketplace", 20], ["wholesale", 10]])
      const customerId = channel === "wholesale" ? pick(wholesaleIds) : weighted(retailWeights)
      const customer = customerList.find((c) => c.id === customerId)!

      const lineCount = channel === "wholesale" ? int(2, 4) : weighted([[1, 70], [2, 23], [3, 7]])
      const lines: OrderLine[] = []
      for (let i = 0; i < lineCount; i++) {
        const product = weighted(productWeights)
        if (lines.some((l) => l.productId === product.id)) continue
        const wholesaleSize = pick(["30×40", "50×70"] as const)
        const asked = channel === "wholesale" ? 0 : weighted(SIZES.flatMap((_, s) => FINISHES.map((__, f) => [s * 3 + f, (s === 0 ? 5 : s === 1 ? 4 : 1.4) * (f === 0 ? 3 : 1.6)] as const)))
        const variant = channel === "wholesale" ? variantOf(product, wholesaleSize, "Unframed") : variantOf(product, SIZES[Math.floor(asked / 3)], FINISHES[asked % 3])
        const quantity = channel === "wholesale" ? int(2, 6) : weighted([[1, 88], [2, 12]])
        const price = channel === "wholesale" ? Math.round((variant.price * 0.6) / 100) * 100 : variant.price
        lines.push({ productId: product.id, variantId: variant.id, name: product.name, variantTitle: variantTitle(variant), photo: product.photo, quantity, price })
      }
      const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
      const coded = channel === "online" && rand() < 0.12
      const discount = coded ? Math.round(subtotal * 0.1) : 0
      const { cost: shipping, method } = shippingFor(customer.address.country, subtotal, channel)
      const total = subtotal - discount + shipping
      const tax = Math.round((total * 23) / 123)

      /* What happened to it since. */
      const ageDays = (NOW - at) / DAY
      const cancelled = ageDays > 1 && rand() < 0.012
      const refundRoll = rand()
      const refundedFully = !cancelled && ageDays > 2.5 && refundRoll < 0.032
      const refundedPart = !cancelled && !refundedFully && ageDays > 2.5 && refundRoll < 0.06 && lines.length > 1
      const invoiced = channel === "wholesale" && ageDays < 30 && rand() < 0.55
      const fulfilled = !cancelled && (ageDays > 2.2 || (ageDays > 0.9 && rand() < 0.55))
      const payment: PaymentStatus = cancelled ? "voided" : refundedFully ? "refunded" : refundedPart ? "partially_refunded" : invoiced ? "pending" : "paid"
      const refunded = refundedFully ? total : refundedPart ? lines[lines.length - 1].price * lines[lines.length - 1].quantity : 0

      const events: OrderEvent[] = []
      const ev = (offset: number, kind: OrderEventKind, text: string, by?: string) =>
        events.push({ id: `${number}-${events.length + 1}`, at: iso(Math.min(at + offset, NOW - 60_000)), kind, text, by })
      const channelName = channel === "online" ? "the online store" : channel === "marketplace" ? "the marketplace" : "a wholesale order form"
      ev(0, "placed", `Order placed on ${channelName}.`)
      if (invoiced) ev(4 * 60_000, "invoice", `Invoice sent to ${customer.email}, due in 30 days.`, "Pieter de Vries")
      else if (!cancelled || rand() < 0.5) ev(40_000, "paid", channel === "marketplace" ? "Payment received through the marketplace." : `Payment of €${(total / 100).toFixed(2)} captured by card.`)
      let tracking: Order["tracking"]
      if (fulfilled) {
        const carrier = customer.address.country === "Ireland" ? CARRIERS.Ireland : CARRIERS.other
        tracking = { carrier, number: carrier === "An Post" ? `CE${int(100_000_000, 999_999_999)}IE` : `${int(1_000_000_000, 9_999_999_999)}` }
        const shipped = Math.min(int(20, 46) * 3_600_000, (NOW - at) * 0.8)
        ev(shipped, "fulfilled", `Fulfilled ${lines.reduce((n, l) => n + l.quantity, 0)} items. ${carrier} ${tracking.number}.`, pick(STAFF))
        if (ageDays > 5) ev(shipped + int(2, 4) * DAY, "delivered", `Delivered to ${customer.address.city}.`)
      }
      if (refundedFully) ev(Math.min(int(2, 8) * DAY, (NOW - at) * 0.9), "refunded", `Refunded €${(refunded / 100).toFixed(2)}. Arrived with a cracked frame.`, "Niamh Brennan")
      if (refundedPart) ev(Math.min(int(2, 8) * DAY, (NOW - at) * 0.9), "refunded", `Refunded €${(refunded / 100).toFixed(2)} for ${lines[lines.length - 1].name}. Wrong size ordered.`, "Saoirse Doyle")
      if (cancelled) ev(int(2, 10) * 3_600_000, "cancelled", "Cancelled at the customer's request before dispatch.", "Tomás Reilly")
      events.sort((a, b) => a.at.localeCompare(b.at))

      orderList.push({
        number: number++,
        customerId,
        createdAt: iso(at),
        channel,
        lines,
        subtotal,
        discount,
        discountCode: coded ? "TIDE10" : undefined,
        shipping,
        shippingMethod: method,
        tax,
        total,
        refunded,
        payment,
        fulfilment: fulfilled ? "fulfilled" : "unfulfilled",
        status: cancelled ? "cancelled" : "open",
        tracking,
        address: customer.address,
        events,
      })
    }
  }
}

/* A customer joined the day of their first order, or a little before for those with none. */
for (const c of customerList) {
  const first = orderList.find((o) => o.customerId === c.id)
  c.createdAt = first ? first.createdAt : iso(TODAY - int(3, 160) * DAY + int(8, 20) * 3_600_000)
}

export const orders: Order[] = orderList
export const customers: Customer[] = customerList

/* ------------------------------------------------------------------ traffic */

const SOURCE_SHARE: [Source, number][] = [["search", 34], ["instagram", 22], ["direct", 18], ["pinterest", 12], ["newsletter", 8], ["other", 6]]
const DEVICE_SHARE: [Device, number][] = [["mobile", 61], ["desktop", 33], ["tablet", 6]]

/** Splits a whole number into parts that add up to it, by rough shares. */
function split<K extends string>(total: number, shares: [K, number][], wobble: number): Record<K, number> {
  const weights = shares.map(([k, w]) => [k, w * between(1 - wobble, 1 + wobble)] as const)
  const sum = weights.reduce((s, [, w]) => s + w, 0)
  const out = {} as Record<K, number>
  let left = total
  weights.forEach(([k, w], i) => {
    const n = i === weights.length - 1 ? left : Math.round((total * w) / sum)
    out[k] = n
    left -= n
  })
  return out
}

export const traffic: TrafficDay[] = Array.from({ length: HISTORY_DAYS }, (_, i) => {
  const day = TODAY - (HISTORY_DAYS - 1 - i) * DAY
  const end = day + DAY
  const online = orderList.filter((o) => o.channel === "online" && Date.parse(o.createdAt) >= day && Date.parse(o.createdAt) < end).length
  const sessions = Math.round(online * between(38, 50) + between(34, 70))
  const addedToCart = Math.round(sessions * between(0.068, 0.088))
  const reachedCheckout = Math.max(online + int(1, 3), Math.round(addedToCart * between(0.44, 0.56)))
  return {
    date: iso(day),
    sessions,
    addedToCart: Math.max(addedToCart, reachedCheckout + 1),
    reachedCheckout,
    sources: split(sessions, SOURCE_SHARE, 0.18),
    devices: split(sessions, DEVICE_SHARE, 0.08),
  }
})

export const SOURCE_LABEL: Record<Source, string> = {
  search: "Search",
  instagram: "Instagram",
  direct: "Direct",
  pinterest: "Pinterest",
  newsletter: "Newsletter",
  other: "Other sites",
}
export const DEVICE_LABEL: Record<Device, string> = { mobile: "Phone", desktop: "Desktop", tablet: "Tablet" }

/* ------------------------------------------------------------------ the rest of the account */

const latest = orderList[orderList.length - 1]
const lastRefund = [...orderList].reverse().find((o) => o.payment === "refunded")

export const notifications: Notification[] = [
  { id: "n1", at: latest.createdAt, kind: "order", title: `New order #${latest.number}`, body: `${customerList.find((c) => c.id === latest.customerId)!.name} · ${latest.lines[0].name}${latest.lines.length > 1 ? ` and ${latest.lines.length - 1} more` : ""}`, to: `/orders/${latest.number}`, read: false },
  { id: "n2", at: iso(NOW - 3 * 3_600_000), kind: "stock", title: "Pebble shore is out of stock", body: "50×70 cm · Black frame. 3 orders this week asked for it.", to: `/products/${products[1].id}`, read: false },
  { id: "n3", at: iso(NOW - 7 * 3_600_000), kind: "review", title: "New five-star review", body: "“The jetty looks even better on the wall than on the screen.”", read: false },
  { id: "n4", at: iso(NOW - 26 * 3_600_000), kind: "payout", title: "Payout of €2,184.60 sent", body: "To AIB ···· 4417, arriving Friday.", read: true },
  ...(lastRefund ? [{ id: "n5", at: lastRefund.events.find((e) => e.kind === "refunded")?.at ?? lastRefund.createdAt, kind: "refund" as const, title: `Refund issued on #${lastRefund.number}`, body: "Arrived with a cracked frame. Replacement sent.", to: `/orders/${lastRefund.number}`, read: true }] : []),
  { id: "n6", at: iso(NOW - 3 * DAY), kind: "team", title: "Lena Hoffmann hasn't joined yet", body: "Her invitation as a viewer expires in 4 days.", to: "/settings/team", read: true },
  { id: "n7", at: iso(NOW - 4 * DAY), kind: "stock", title: "Canal houses is running low", body: "30×40 cm · Oak frame. 2 left after De Kaart's restock.", to: "/products/p03", read: true },
  { id: "n8", at: iso(NOW - 5 * DAY), kind: "payout", title: "Payout of €1,962.10 sent", body: "To AIB ···· 4417. It arrived on Monday.", read: true },
  { id: "n9", at: iso(NOW - 6 * DAY), kind: "review", title: "New four-star review", body: "“Beautiful print, the oak frame is lovely. Took a week to arrive.”", read: true },
  { id: "n10", at: iso(NOW - 8 * DAY), kind: "team", title: "Saoirse Doyle changed 9 prices", body: "The Coast collection's framed sizes, ahead of the winter sale.", to: "/products", read: true },
  { id: "n11", at: iso(NOW - 12 * DAY), kind: "payout", title: "Payout of €2,407.85 sent", body: "To AIB ···· 4417. It arrived on Friday.", read: true },
]

export const settings: StoreSettings = {
  name: "Tideline Prints",
  legalName: "Tideline Prints Ltd.",
  email: "hello@tidelineprints.com",
  phone: "+353 91 562 118",
  address: { line1: "Unit 4, The Long Walk", city: "Galway", postcode: "H91 T2C8", country: "Ireland" },
  currency: "EUR",
  timezone: "Europe/Dublin",
  vatNumber: "IE 3381427WH",
  orderPrefix: "#",
  notifications: { newOrder: true, lowStock: true, refunds: true, weeklySummary: false },
  lowStockAt: 3,
}

export const plan: Plan = {
  name: "Growth",
  price: 4900,
  renews: iso(Date.UTC(2026, 11, 3)),
  usage: [
    { label: "Orders this month", used: orderList.filter((o) => o.createdAt >= iso(Date.UTC(2026, 10, 1))).length, limit: 1000 },
    { label: "Staff seats", used: team.length, limit: 8 },
    { label: "File storage", used: 3.2, limit: 10, unit: "GB" },
  ],
}

export const invoices: Invoice[] = Array.from({ length: 6 }, (_, i) => ({
  id: `INV-2026-${String(11 - i).padStart(3, "0")}`,
  date: iso(Date.UTC(2026, 10 - i, 3)),
  amount: 4900,
  status: "paid" as const,
}))
