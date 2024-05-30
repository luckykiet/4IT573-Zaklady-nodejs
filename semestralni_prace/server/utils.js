const addSpaceForTelephoneNumber = (
  string,
  clearPrefix = false
) => {
  try {
    let input = string
    if (clearPrefix) {
      input = input.replace("+420", "")
    }
    const cleanedValue = input.replace(/\s/g, "")
    const formattedValue = cleanedValue.replace(
      /(\d{3})(?=\d)/g,
      "$1 "
    )
    return formattedValue.trim()
  } catch (error) {
    return ""
  }
}

export default { addSpaceForTelephoneNumber }
