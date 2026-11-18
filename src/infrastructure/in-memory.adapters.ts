import type { Appointment } from "../domain/appointment.entity";
import { DailySchedule } from "../domain/daily-schedule.aggregate";
import { Appointment as AppointmentEntity } from "../domain/appointment.entity";
import { toDateKey } from "../domain/date-key";

/** In-memory хранилище расписаний по дате. Удобно для тестов и демо. */
export const dailySchedules = new Map<string, DailySchedule>();

export const inMemoryFindOrCreateDailyScheduleAdapter = async (
	date: string,
): Promise<DailySchedule> => {
	const existing = dailySchedules.get(date);
	if (existing) return existing;

	const schedule = DailySchedule.create({ id: date, appointments: [] });
	dailySchedules.set(date, schedule);
	return schedule;
};

export const inMemorySaveDailyScheduleAdapter = async (
	schedule: DailySchedule,
): Promise<void> => {
	dailySchedules.set(schedule.state.id, schedule);
};

export const inMemoryFindAppointmentByIdAdapter = async (
	appointmentId: string,
): Promise<Appointment | null> => {
	for (const schedule of dailySchedules.values()) {
		const appointment = schedule.state.appointments.find(
			(item) => item.id === appointmentId,
		);
		if (appointment) {
			return AppointmentEntity.create(appointment);
		}
	}
	return null;
};

export const inMemoryFindSchedulesByDateRangeAdapter = async (query: {
	startDate: Date;
	endDate: Date;
}): Promise<DailySchedule[]> => {
	const result: DailySchedule[] = [];

	for (
		let day = new Date(query.startDate);
		day <= query.endDate;
		day.setDate(day.getDate() + 1)
	) {
		const date = toDateKey(day);
		const schedule = dailySchedules.get(date);
		if (schedule) result.push(schedule);
	}

	return result;
};

export const resetInMemoryStore = (): void => {
	dailySchedules.clear();
};
