import Link from "next/link"

import { highlights } from "@site/lib/product"

/* What Keyframery gives you, from content/product.json: the same list the README shows. */
export function ProductHighlights() {
  return (
    <table>
      <tbody>
        {highlights.map((h) => (
          <tr key={h.title}>
            <td className="whitespace-nowrap align-top">
              <Link href={h.href} className="font-semibold">
                {h.title}
              </Link>
            </td>
            <td>{h.body}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
