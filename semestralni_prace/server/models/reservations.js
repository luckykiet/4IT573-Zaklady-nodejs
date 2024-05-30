import mongoose from "mongoose"
import ReservationSchema from "./schemas/reservation.js"

const Reservations = mongoose.model(
  "reservations",
  ReservationSchema
)

export default Reservations
