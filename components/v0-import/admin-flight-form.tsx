"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Flight } from "@/lib/types"

interface FlightFormProps {
  isOpen: boolean
  flight: Flight | null
  onClose: () => void
  onSubmit: (flight: Flight) => void
}

export default function FlightForm({ isOpen, flight, onClose, onSubmit }: FlightFormProps) {
  const [formData, setFormData] = useState<Partial<Flight>>({
    flight_code: "",
    transfer_date: "",
    transfer_time: "",
    destination_pickup: "",
    destination_dropoff: "",
    guest_name: "",
    guest_count: 1,
    notes: "",
  })
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (flight) {
      setFormData({
        ...flight,
      })

      if (flight.transfer_date) {
        try {
          setDate(new Date(flight.transfer_date))
        } catch (e) {
          setDate(undefined)
        }
      }
    } else {
      resetForm()
    }
  }, [flight, isOpen])

  const resetForm = () => {
    setFormData({
      flight_code: "",
      transfer_date: "",
      transfer_time: "",
      destination_pickup: "",
      destination_dropoff: "",
      guest_name: "",
      guest_count: 1,
      notes: "",
    })
    setDate(undefined)
    setErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setFormData((prev) => ({
        ...prev,
        transfer_date: format(newDate, "yyyy-MM-dd"),
      }))

      // Clear error for this field
      if (errors.transfer_date) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.transfer_date
          return newErrors
        })
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.flight_code) {
      newErrors.flight_code = "Flight code is required"
    }

    if (!formData.transfer_date) {
      newErrors.transfer_date = "Transfer date is required"
    }

    if (!formData.transfer_time) {
      newErrors.transfer_time = "Transfer time is required"
    }

    if (!formData.guest_name) {
      newErrors.guest_name = "Guest name is required"
    }

    if (!formData.destination_pickup) {
      newErrors.destination_pickup = "Pickup location is required"
    }

    if (!formData.destination_dropoff) {
      newErrors.destination_dropoff = "Dropoff location is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Combine date and time for the database
      const completeData = {
        ...formData,
        id: flight?.id,
      } as Flight

      await onSubmit(completeData)
      resetForm()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{flight ? "Edit Flight" : "Add New Flight"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flight_code">Flight Code</Label>
              <Input
                id="flight_code"
                name="flight_code"
                value={formData.flight_code || ""}
                onChange={handleChange}
                className={errors.flight_code ? "border-destructive" : ""}
              />
              {errors.flight_code && <p className="text-sm text-destructive">{errors.flight_code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer_date">Transfer Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.transfer_date && "text-muted-foreground",
                      errors.transfer_date && "border-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.transfer_date ? format(new Date(formData.transfer_date), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.transfer_date && <p className="text-sm text-destructive">{errors.transfer_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer_time">Transfer Time</Label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="transfer_time"
                  name="transfer_time"
                  type="time"
                  value={formData.transfer_time || ""}
                  onChange={handleChange}
                  className={cn("pl-8", errors.transfer_time && "border-destructive")}
                />
              </div>
              {errors.transfer_time && <p className="text-sm text-destructive">{errors.transfer_time}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest_name">Guest Name</Label>
              <Input
                id="guest_name"
                name="guest_name"
                value={formData.guest_name || ""}
                onChange={handleChange}
                className={errors.guest_name ? "border-destructive" : ""}
              />
              {errors.guest_name && <p className="text-sm text-destructive">{errors.guest_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest_count">Guest Count</Label>
              <Input
                id="guest_count"
                name="guest_count"
                type="number"
                min="1"
                value={formData.guest_count || 1}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination_pickup">Pickup Location</Label>
              <Input
                id="destination_pickup"
                name="destination_pickup"
                value={formData.destination_pickup || ""}
                onChange={handleChange}
                className={errors.destination_pickup ? "border-destructive" : ""}
              />
              {errors.destination_pickup && <p className="text-sm text-destructive">{errors.destination_pickup}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination_dropoff">Dropoff Location</Label>
              <Input
                id="destination_dropoff"
                name="destination_dropoff"
                value={formData.destination_dropoff || ""}
                onChange={handleChange}
                className={errors.destination_dropoff ? "border-destructive" : ""}
              />
              {errors.destination_dropoff && <p className="text-sm text-destructive">{errors.destination_dropoff}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} value={formData.notes || ""} onChange={handleChange} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Flight"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

