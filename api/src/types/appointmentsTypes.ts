export interface CreateAppointmentBody {
  customerName: string
  customerPhone?: string
  startTime: string
  serviceId: string
}