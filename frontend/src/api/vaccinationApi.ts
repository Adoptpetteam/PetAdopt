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

export async function listMyVaccinations() {
  const { data } = await apiClient.get<{ success: boolean; data: VaccinationSchedule[] }>(
    "/vaccinations/me"
  );
  return data;
}

export async function listVaccinationsAdmin(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<{
    success: boolean;
    data: VaccinationSchedule[];
    pagination?: { page: number; limit: number; total: number; pages: number };
  }>("/vaccinations/admin", { params });
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
  notes?: string;
}) {
  const { data } = await apiClient.post<{ success: boolean; data: VaccinationSchedule }>(
    "/vaccinations/admin",
    payload
  );
  return data;
}

export async function updateVaccination(id: string, patch: Partial<VaccinationSchedule>) {
  const { data } = await apiClient.put<{ success: boolean; data: VaccinationSchedule }>(
    `/vaccinations/admin/${id}`,
    patch
  );
  return data;
}

export async function deleteVaccination(id: string) {
  const { data } = await apiClient.delete<{ success: boolean }>(`/vaccinations/admin/${id}`);
  return data;
}

export async function sendReminderManual(id: string) {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>(
    `/vaccinations/admin/${id}/send-reminder`
  );
  return data;
}

export async function sendInfoEmail(id: string) {
  const { data } = await apiClient.post<{ success: boolean }>(`/vaccinations/admin/${id}/send-info`);
  return data;
}

export async function bulkSendReminders(ids: string[]) {
  const { data } = await apiClient.post<{ success: boolean; results?: unknown }>(
    "/vaccinations/admin/bulk-send-reminders",
    { ids }
  );
  return data;
}
