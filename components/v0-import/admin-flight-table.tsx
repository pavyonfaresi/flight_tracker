"use client"

import { useState } from "react"
import { Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Flight } from "@/lib/types"
import { createClient } from "@/lib/supabase-client"

interface FlightTableProps {
  flights: Flight[]
  isLoading: boolean
  onEdit: (flight: Flight) => void
}

export default function FlightTable({ flights, isLoading, onEdit }: FlightTableProps) {
  const [deleteFlightId, setDeleteFlightId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteFlightId) return

    setIsDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from("transfers").delete().eq("id", deleteFlightId)

      // Refresh the page to update the table
      window.location.reload()
    } catch (error) {
      console.error("Error deleting flight:", error)
    } finally {
      setIsDeleting(false)
      setDeleteFlightId(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy")
    } catch (e) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flight Code</TableHead>
              <TableHead>Transfer Date</TableHead>
              <TableHead>Transfer Time</TableHead>
              <TableHead>Guest Name</TableHead>
              <TableHead className="text-center">Guest Count</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No flights found.
                </TableCell>
              </TableRow>
            ) : (
              flights.map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell className="font-medium">{flight.flight_code}</TableCell>
                  <TableCell>{formatDate(flight.transfer_date)}</TableCell>
                  <TableCell>{flight.transfer_time || "-"}</TableCell>
                  <TableCell>{flight.guest_name}</TableCell>
                  <TableCell className="text-center">{flight.guest_count}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{flight.notes || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(flight)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteFlightId(flight.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteFlightId !== null} onOpenChange={(open) => !open && setDeleteFlightId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the flight record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

