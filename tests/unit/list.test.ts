import { expect, it } from "vitest"

import { diffIds } from "../../registry/lib/keyframery/list"

it("diffIds sorts ids into arrived, left and stayed", () => {
  expect(diffIds([1, 2, 3], [3, 1, 4])).toEqual({ entered: [4], exited: [2], kept: [3, 1] })
  expect(diffIds([], ["a"])).toEqual({ entered: ["a"], exited: [], kept: [] })
  expect(diffIds(["a"], [])).toEqual({ entered: [], exited: ["a"], kept: [] })
})
