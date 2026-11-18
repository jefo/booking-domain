import { randomUUID } from "node:crypto";
import { composeBookingContext } from "./src/composition";
import { scheduleAppointmentUseCase } from "./src/application/schedule-appointment.use-case";
import { getAvailableTimeSlotsUseCase } from "./src/application/get-available-time-slots.use-case";
import { cancelAppointmentUseCase } from "./src/application/cancel-appointment.use-case";

const day = new Date();
day.setDate(day.getDate() + 1);
day.setHours(0, 0, 0, 0);

const dayEnd = new Date(day);
dayEnd.setHours(23, 59, 59, 999);

const startTime = new Date(day);
startTime.setHours(10, 0, 0, 0);

composeBookingContext();

const before = await getAvailableTimeSlotsUseCase({
	startDate: day,
	endDate: dayEnd,
});
console.log(`Свободных слотов до записи: ${before.length}`);

const clientId = randomUUID();
const appointment = await scheduleAppointmentUseCase({
	clientId,
	startTime,
	durationInMinutes: 60,
});
console.log(`Создана заявка ${appointment.appointmentId}`);

const after = await getAvailableTimeSlotsUseCase({
	startDate: day,
	endDate: dayEnd,
});
console.log(`Свободных слотов после записи: ${after.length}`);

const cancelled = await cancelAppointmentUseCase({
	appointmentId: appointment.appointmentId,
});
console.log(`Статус заявки: ${cancelled.status}`);

const restored = await getAvailableTimeSlotsUseCase({
	startDate: day,
	endDate: dayEnd,
});
console.log(`Свободных слотов после отмены: ${restored.length}`);
