import test from "ava"
import { fizzbuzz } from "../src/fizzbuzz.js"

test("it returns fizz for number 9", (t) => {
  const result = fizzbuzz(9)
  t.is(result, "fizz")
})

test("it returns buzz for number 5", (t) => {
  const result = fizzbuzz(5)
  t.is(result, "buzz")
})

test("it returns fizzbuzz for number 15", (t) => {
  const result = fizzbuzz(15)
  t.is(result, "fizzbuzz")
})

test("it returns 4 for number 4", (t) => {
  const result = fizzbuzz(4)
  t.is(result, 4)
})
