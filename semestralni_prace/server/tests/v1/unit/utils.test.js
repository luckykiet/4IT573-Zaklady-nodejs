import utils from "../../../utils"
const { addSpaceForTelephoneNumber } = utils
test("Test add space for phone number", () => {
  expect(addSpaceForTelephoneNumber("222", false)).toBe(
    "222"
  )
  expect(
    addSpaceForTelephoneNumber("777111222", false)
  ).toBe("777 111 222")
  expect(addSpaceForTelephoneNumber("77711", false)).toBe(
    "777 11"
  )
  expect(addSpaceForTelephoneNumber("77711", true)).toBe(
    "777 11"
  )
  expect(
    addSpaceForTelephoneNumber("+42077711", true)
  ).toBe("777 11")
})
