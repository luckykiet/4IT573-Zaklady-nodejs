import utils from "../../../utils"
const {
  addSpaceForTelephoneNumber,
  isValidRequest,
  createEnumRegex,
} = utils

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

describe("isValidRequest", () => {
  const endpoint = "test_endpoint"

  const validator = {
    name: /^[a-zA-Z]+$/,
    age: (value) => value >= 18 && value <= 99,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }

  test("returns true for a valid request", () => {
    const request = {
      name: "John",
      age: 30,
      email: "john@example.com",
    }
    expect(
      isValidRequest(validator, request, endpoint)
    ).toBe(true)
  })

  test("returns false for an invalid request (invalid name)", () => {
    const request = {
      name: "John123",
      age: 30,
      email: "john@example.com",
    }
    expect(
      isValidRequest(validator, request, endpoint)
    ).toBe(false)
  })

  test("returns false for an invalid request (invalid age)", () => {
    const request = {
      name: "John",
      age: 17,
      email: "john@example.com",
    }
    expect(
      isValidRequest(validator, request, endpoint)
    ).toBe(false)
  })

  test("returns false for an invalid request (invalid email)", () => {
    const request = {
      name: "John",
      age: 30,
      email: "johnexample.com",
    }
    expect(
      isValidRequest(validator, request, endpoint)
    ).toBe(false)
  })

  test("returns false for a request with missing keys", () => {
    const request = {
      name: "John",
      age: 30,
    }
    expect(
      isValidRequest(validator, request, endpoint)
    ).toBe(false)
  })

  test("returns false for a request with extra keys", () => {
    const request = {
      name: "John",
      age: 30,
      email: "john@example.com",
      extra: "extra_value",
    }
    expect(
      isValidRequest(validator, request, endpoint)
    ).toBe(false)
  })

  test("returns false for a request with all invalid fields", () => {
    const request = {
      name: "John123",
      age: 17,
      email: "johnexample.com",
    }
    expect(
      isValidRequest(validator, request, endpoint)
    ).toBe(false)
  })

  test("returns true when validator functions are used correctly", () => {
    const customValidator = {
      key: (value) => value === "valid",
    }
    const request = {
      key: "valid",
    }
    expect(
      isValidRequest(customValidator, request, endpoint)
    ).toBe(true)
  })

  test("returns false when validator functions are used incorrectly", () => {
    const customValidator = {
      key: (value) => value === "valid",
    }
    const request = {
      key: "invalid",
    }
    expect(
      isValidRequest(customValidator, request, endpoint)
    ).toBe(false)
  })
})
describe("createEnumRegex", () => {
  describe("when provided with valid arrays", () => {
    test("should return true for valid strings in the array", () => {
      const array = ["string", "false", "true"]

      expect(createEnumRegex(array).test("string")).toBe(
        true
      )
      expect(createEnumRegex(array).test("false")).toBe(
        true
      )
      expect(createEnumRegex(array).test("true")).toBe(true)
    })

    test("should return false for strings not in the array", () => {
      const array = ["string", "false", "true"]

      expect(createEnumRegex(array).test("lala")).toBe(
        false
      )
      expect(createEnumRegex(array).test("haha")).toBe(
        false
      )
      expect(createEnumRegex(array).test("")).toBe(false)
    })
  })

  describe("when provided with invalid or empty arrays", () => {
    test("should handle empty array", () => {
      const array1 = []
      expect(createEnumRegex(array1).test("")).toBe(true)
      expect(createEnumRegex(array1).test("true")).toBe(
        false
      )
      expect(createEnumRegex(array1).test("haha")).toBe(
        false
      )
    })

    test("should handle non-array types", () => {
      const array2 = ""
      expect(createEnumRegex(array2).test("")).toBe(true)
      expect(createEnumRegex(array2).test("true")).toBe(
        false
      )
      expect(createEnumRegex(array2).test("haha")).toBe(
        false
      )

      const array3 = {}
      expect(createEnumRegex(array3).test("")).toBe(true)
      expect(createEnumRegex(array3).test("true")).toBe(
        false
      )
      expect(createEnumRegex(array3).test("haha")).toBe(
        false
      )

      const array4 = true
      expect(createEnumRegex(array4).test("")).toBe(true)
      expect(createEnumRegex(array4).test("true")).toBe(
        false
      )
      expect(createEnumRegex(array4).test("haha")).toBe(
        false
      )
    })
  })

  describe("when provided with arrays of mixed types", () => {
    test("should return true for valid mixed types in the array", () => {
      const mixedArray = [
        "string",
        42,
        false,
        true,
        "anotherString",
      ]

      expect(
        createEnumRegex(mixedArray).test("string")
      ).toBe(true)
      expect(createEnumRegex(mixedArray).test("42")).toBe(
        true
      )
      expect(
        createEnumRegex(mixedArray).test("false")
      ).toBe(true)
      expect(createEnumRegex(mixedArray).test("true")).toBe(
        true
      )
      expect(
        createEnumRegex(mixedArray).test("anotherString")
      ).toBe(true)
    })

    test("should return false for values not in the mixed array", () => {
      const mixedArray = [
        "string",
        42,
        false,
        true,
        "anotherString",
      ]

      expect(createEnumRegex(mixedArray).test("lala")).toBe(
        false
      )
      expect(createEnumRegex(mixedArray).test("43")).toBe(
        false
      )
      expect(createEnumRegex(mixedArray).test("")).toBe(
        false
      )
      expect(
        createEnumRegex(mixedArray).test("anotherString")
      ).toBe(true)
    })
  })
})
