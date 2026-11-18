import { createPort } from "@maxdev1/sotajs";
import type { Appointment } from "../domain/appointment.entity";
import type { DailySchedule } from "../domain/daily-schedule.aggregate";

/** Загружает расписание на дату или создаёт пустое. */
export const findOrCreateDailySchedulePort = createPort<
	(date: string) => Promise<DailySchedule>
>();

/** Сохраняет изменённое расписание. */
export const saveDailySchedulePort = createPort<
	(schedule: DailySchedule) => Promise<void>
>();

/** Нужен, чтобы по заявке найти день и загрузить его расписание. */
export const findAppointmentByIdPort = createPort<
	(appointmentId: string) => Promise<Appointment | null>
>();

/** Все расписания за период — для расчёта свободных окон. */
export const findSchedulesByDateRangePort = createPort<
	(query: { startDate: Date; endDate: Date }) => Promise<DailySchedule[]>
>();
