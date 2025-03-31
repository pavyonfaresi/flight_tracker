"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, PlusCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import AdminFlightTable from "@/components/admin-flight-table"
import AdminFlightForm from "@/components/admin-flight-form"
import { createClient } from "@/lib/supabase-client"
import type { Flight } from "@/lib/types"

export default function AdminDashboard() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFlights()
  }, [])

  useEffect(() => {
    filterFlights()
  }, [flights, searchQuery, date])

  const fetchFlights = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("transfers").select("*").order("transfer_date", { ascending: false })

      if (error) throw error
      setFlights(data || [])
      setFilteredFlights(data || [])
    } catch (error) {
      console.error("Error fetching flights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterFlights = () => {
    let filtered = [...flights]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (flight) =>
          flight.flight_code.toLowerCase().includes(query) ||
          flight.guest_name.toLowerCase().includes(query) ||
          (flight.notes && flight.notes.toLowerCase().includes(query)),
      )
    }

    // Apply date filter
    if (date) {
      const dateStr = format(date, "yyyy-MM-dd")
      filtered = filtered.filter((flight) => flight.transfer_date.startsWith(dateStr))
    }

    setFilteredFlights(filtered)
  }

  const handleAddFlight = () => {
    setEditingFlight(null)
    setIsFormOpen(true)
  }

  const handleEditFlight = (flight: Flight) => {
    setEditingFlight(flight)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingFlight(null)
  }

  const handleFormSubmit = async (flight: Flight) => {
    try {
      const supabase = createClient()

      if (editingFlight) {
        // Update existing flight
        await supabase.from("transfers").update(flight).eq("id", flight.id)
      } else {
        // Add new flight
        await supabase.from("transfers").insert([flight])
      }

      fetchFlights()
      handleFormClose()
    } catch (error) {
      console.error("Error saving flight:", error)
    }
  }

  const clearDateFilter = () => {
    setDate(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search flights..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              {date && (
                <div className="p-3 border-t">
                  <Button variant="ghost" size="sm" onClick={clearDateFilter} className="w-full">
                    Clear filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Button onClick={handleAddFlight}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Flight
          </Button>
        </div>
      </div>

      <AdminFlightTable flights={filteredFlights} isLoading={isLoading} onEdit={handleEditFlight} />

      <AdminFlightForm
        isOpen={isFormOpen}
        flight={editingFlight}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

