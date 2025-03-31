export interface Flight {
  id: number
  flight_code: string
  transfer_date: string
  transfer_time: string
  destination_pickup: string
  destination_dropoff: string
  guest_name: string
  guest_count: number
  notes?: string
}

