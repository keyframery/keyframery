/* Everything the Round landing page says and shows. Change the copy, people, bills and prices here;
   the sections read from this file and nothing else. Amounts are in US dollars and converted on screen. */

export type PersonId = "you" | "maya" | "jo" | "sam" | "alex" | "noor"

export type Person = {
  id: PersonId
  name: string
  /** The slice colour on the blue hero ring, and the text that sits on it. */
  tone: string
  ink: string
  /** The same person on a light card, where a white slice would vanish, and the text that sits on that. */
  chip: string
  chipInk: string
  face?: string
}

export const people: Person[] = [
  { id: "you", name: "You", tone: "#ffffff", ink: "#0d0f1f", chip: "#2431e0", chipInk: "#ffffff" },
  { id: "maya", name: "Maya", tone: "#ff4d24", ink: "#ffffff", chip: "#ff4d24", chipInk: "#ffffff", face: "/demo/face-2.jpg" },
  { id: "jo", name: "Jo", tone: "#ffb9d5", ink: "#0d0f1f", chip: "#ff8fbc", chipInk: "#0d0f1f", face: "/demo/face-3.jpg" },
  { id: "sam", name: "Sam", tone: "#a8d4ff", ink: "#0d0f1f", chip: "#7dbcff", chipInk: "#0d0f1f", face: "/demo/face-4.jpg" },
  { id: "alex", name: "Alex", tone: "#0d0f1f", ink: "#ffffff", chip: "#0d0f1f", chipInk: "#ffffff", face: "/demo/face-1.jpg" },
  { id: "noor", name: "Noor", tone: "#ffc7a1", ink: "#0d0f1f", chip: "#ffab73", chipInk: "#0d0f1f" },
]

export const person = (id: PersonId) => people.find((p) => p.id === id)!

export type CurrencyId = "usd" | "eur" | "gbp" | "inr"

export const currencies: Record<CurrencyId, { symbol: string; label: string; rate: number; digits: number }> = {
  usd: { symbol: "$", label: "US dollars", rate: 1, digits: 2 },
  eur: { symbol: "€", label: "Euros", rate: 0.92, digits: 2 },
  gbp: { symbol: "£", label: "Pounds", rate: 0.79, digits: 2 },
  inr: { symbol: "₹", label: "Rupees", rate: 84, digits: 0 },
}

/** The bill on the hero ring. */
export const heroBill = {
  title: "Dinner at Lupa",
  subtotal: 156,
  tip: 18,
  table: ["you", "maya", "jo", "sam"] as PersonId[],
  /** Uneven on purpose, so the ring reads as "someone had the branzino". */
  shares: { you: 0.24, maya: 0.33, jo: 0.25, sam: 0.18 } as Partial<Record<PersonId, number>>,
}

export type Bill = {
  id: string
  tab: string
  title: string
  when: string
  thumb: string
  table: PersonId[]
  items: { name: string; price: number; who: PersonId[] }[]
}

export const bills: Bill[] = [
  {
    id: "dinner",
    tab: "Dinner out",
    title: "Dinner at Lupa",
    when: "Friday, table for four",
    thumb: "/demo/food-1.jpg",
    table: ["you", "maya", "jo", "sam"],
    items: [
      { name: "Burrata for the table", price: 16, who: ["you", "maya", "jo", "sam"] },
      { name: "Cacio e pepe", price: 21, who: ["you"] },
      { name: "Wood-fired branzino", price: 34, who: ["maya"] },
      { name: "Two negronis", price: 28, who: ["jo", "sam"] },
      { name: "Tiramisu, two spoons", price: 12, who: ["you", "jo"] },
    ],
  },
  {
    id: "trip",
    tab: "Weekend away",
    title: "Three nights in Amalfi",
    when: "May, four of you",
    thumb: "/demo/coast-1.jpg",
    table: ["you", "maya", "alex", "noor"],
    items: [
      { name: "Villa, three nights", price: 720, who: ["you", "maya", "alex", "noor"] },
      { name: "Car hire", price: 186, who: ["you", "alex"] },
      { name: "Boat day", price: 240, who: ["maya", "alex", "noor"] },
      { name: "Groceries", price: 96, who: ["you", "maya", "alex", "noor"] },
    ],
  },
  {
    id: "flat",
    tab: "The flat",
    title: "42 Canal Street",
    when: "March, two of you",
    thumb: "/demo/canal.jpg",
    table: ["you", "sam"],
    items: [
      { name: "Rent", price: 1850, who: ["you", "sam"] },
      { name: "Electricity", price: 88, who: ["you", "sam"] },
      { name: "Internet", price: 45, who: ["you", "sam"] },
      { name: "Cleaner, Sam's idea", price: 60, who: ["sam"] },
    ],
  },
  {
    id: "gig",
    tab: "Gig night",
    title: "Tickets and a taxi",
    when: "Saturday, three of you",
    thumb: "/demo/gig.jpg",
    table: ["you", "jo", "alex"],
    items: [
      { name: "Three tickets", price: 135, who: ["you", "jo", "alex"] },
      { name: "Taxi home", price: 32, who: ["you", "jo"] },
      { name: "Tour shirt", price: 40, who: ["alex"] },
    ],
  },
]

/** Who owes you after dinner. Settling clears them one by one. */
export const debts: { from: PersonId; amount: number; note: string }[] = [
  { from: "maya", amount: 46.15, note: "Branzino, burrata" },
  { from: "jo", amount: 31.4, note: "Negroni, half a tiramisu" },
  { from: "sam", amount: 24.7, note: "Negroni, burrata" },
]

export const stats = [
  { from: "0.0M", to: "2.4M", label: "bills split since launch" },
  { from: "00", to: "38", unit: "sec", label: "from photo of the bill to settled" },
  { from: "00", to: "61", unit: "countries", label: "where a table has gone round" },
]

export const quotes = [
  { by: "maya" as PersonId, name: "Maya R.", role: "hosts a supper club", text: "We used to argue about the wine. Now we only argue about dessert." },
  { by: "jo" as PersonId, name: "Jo L.", role: "plans the group trips", text: "I split a villa four ways on the ferry over. It took less time than the safety briefing." },
  { by: "sam" as PersonId, name: "Sam K.", role: "shares a flat", text: "My flatmate and I have not opened the spreadsheet since March. Nobody misses it." },
]

export const plans = [
  {
    id: "free",
    name: "Round",
    line: "Everything a table needs.",
    monthly: 0,
    yearly: 0,
    cta: "Get the app",
    features: ["Unlimited bills", "Up to eight people a bill", "Split by slice, item or evenly", "Pay links for friends without the app"],
  },
  {
    id: "plus",
    name: "Round Plus",
    line: "For the one who always organises.",
    monthly: 4,
    yearly: 36,
    cta: "Try Plus free for a month",
    features: ["Everything in Round", "Photograph a bill and it itemises itself", "Rent and other bills that repeat", "Trips in more than one currency", "Export to a spreadsheet, if you must"],
  },
]

export const faqs = [
  {
    q: "Does everyone at the table need the app?",
    a: "No. One of you splits the bill and the rest get a link. They can see their share, argue with it and pay it from the browser.",
  },
  {
    q: "How does the money actually move?",
    a: "Round works out who owes what and hands the payment to the bank or wallet you already use. We never hold your money, so there is nothing to top up and nothing to withdraw.",
  },
  {
    q: "Can we split unevenly?",
    a: "Three ways. Drag a slice until it looks fair, tap who shared each item, or set exact amounts. You can mix them on the same bill.",
  },
  {
    q: "What happens to tip and tax?",
    a: "They follow what each person ordered, so the one with the branzino tips on the branzino. Flip one switch if your table would rather share them evenly.",
  },
  {
    q: "Which currencies does it handle?",
    a: "Thirty-four of them. On a trip, each person settles in their own currency at the day's rate, and Round shows the rate it used.",
  },
]

export const nav = [
  { href: "#split", label: "Split" },
  { href: "#claim", label: "Claim" },
  { href: "#settle", label: "Settle" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "Questions" },
]
