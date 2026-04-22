import { apiClient } from "./http";

export type VaccinationStatus = "scheduled" | "completed" | "missed" | "cancelled";

export type ReminderSent = {
  before_7?: boolean;
  before_3?: boolean;
  before_1?: boolean;
  due_day?: boolean;
  overdue?: boolean;
};

export type VaccinationSchedule = {
  _id: string;
  pet: { _id: string; name?: string; species?: string; images?: string[] } | string;
  petNameSnapshot?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  vaccineName: string;
  doseNumber: number;
  scheduledAt: string;
  status: VaccinationStatus;
  reminderOffsetsDays?: number[];
  reminderSent?: ReminderSent;
  isReminderSent?: boolean;
  lastReminderAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ListAdminParams = {
  page?: number;
  limit?: number;
  status?: VaccinationStatus;
  from?: string;
  to?: string;
  ownerEmail?: string;
  vaccineName?: string;
  search?: string;
};

export async function listVaccinationsAdmin(params?: ListAdminParams) {
  const { data } = await apiClient.get<{
    success: boolean;
    data: VaccinationSchedule[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  }>("/vaccinations/admin", { params });
  return data;
}

export async function getVaccinationAdmin(id: string) {
  const { data } = await apiClient.get<{ success: boolean; data: VaccinationSchedule }>(
    `/vaccinations/admin/${id}`
  );
  return data;
}

export async function createVaccination(payload: {
  petId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  vaccineName: string;
  doseNumber?: number;
  scheduledAt: string;
  status?: VaccinationStatus;
  reminderOffsetsDays?: number[];
  notes?: string;
}) {
  const { data } = await apiClient.post<{ success: boolean; message?: string; data: VaccinationSchedule }>(
    "/vaccinations/admin",
    payload
  );
  return data;
}

export async function updateVaccination(
  id: string,
  patch: Partial<{
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    vaccineName: string;
    doseNumber: number;
    scheduledAt: string;
    status: VaccinationStatus;
    reminderOffsetsDays: number[];
    notes: string;
    petNameSnapshot: string;
  }>
) {
  const { data } = await apiClient.put<{ success: boolean; message?: string; data: VaccinationSchedule }>(
    `/vaccinations/admin/${id}`,
    patch
  );
  return data;
}

export async function deleteVaccination(id: string) {
  const { data } = await apiClient.delete<{ success: boolean; message?: string }>(
    `/vaccinations/admin/${id}`
  );
  return data;
}

export async function sendReminderManual(id: string, body?: { type?: string }) {
  const { data } = await apiClient.post<{ success: boolean; message?: string; sentType?: string }>(
    `/vaccinations/admin/${id}/send-reminder`,
    body ?? {}
  );
  return data;
}

export async function sendInfoEmail(id: string) {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>(
    `/vaccinations/admin/${id}/send-info`
  );
  return data;
}

export async function bulkSendReminders(ids: string[]) {
  const { data } = await apiClient.post<{ success: boolean; message?: string; results?: unknown }>(
    "/vaccinations/admin/bulk-send-reminders",
    { ids }
  );
  return data;
}

export async function listMyVaccinations() {
  const { data } = await apiClient.get<{ success: boolean; data: VaccinationSchedule[] }>(
    "/vaccinations/me"
  );
  return data;
}
