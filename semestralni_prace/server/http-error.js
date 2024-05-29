//@ts-check

class HttpError extends Error {
  /**
   *
   * @param {string} message
   * @param {number} errorCode
   */
  constructor(message, errorCode) {
    super(JSON.stringify(message))
    this.code = errorCode
  }
}

export default HttpError
