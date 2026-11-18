import { setPortAdapter } from "@maxdev1/sotajs";
import {
	findAppointmentByIdPort,
	findOrCreateDailySchedulePort,
	findSchedulesByDateRangePort,
	saveDailySchedulePort,
} from "./application/ports";
import {
	inMemoryFindAppointmentByIdAdapter,
	inMemoryFindOrCreateDailyScheduleAdapter,
	inMemoryFindSchedulesByDateRangeAdapter,
	inMemorySaveDailyScheduleAdapter,
} from "./infrastructure/in-memory.adapters";

/**
 * Composition root: связывает порты приложения с in-memory адаптерами.
 * В реальном сервисе здесь подставляются Postgres/Redis/CRM.
 */
export const composeBookingContext = (): void => {
	setPortAdapter(
		findOrCreateDailySchedulePort,
		inMemoryFindOrCreateDailyScheduleAdapter,
	);
	setPortAdapter(saveDailySchedulePort, inMemorySaveDailyScheduleAdapter);
	setPortAdapter(
		findAppointmentByIdPort,
		inMemoryFindAppointmentByIdAdapter,
	);
	setPortAdapter(
		findSchedulesByDateRangePort,
		inMemoryFindSchedulesByDateRangeAdapter,
	);
};
