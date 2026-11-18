import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import { TimeSlot } from "../domain/time-slot.vo";
import { toDateKey } from "../domain/date-key";
import {
	findOrCreateDailySchedulePort,
	saveDailySchedulePort,
} from "./ports";

export const ScheduleAppointmentInputSchema = z.object({
	clientId: z.string().uuid(),
	startTime: z.date(),
	durationInMinutes: z.number().positive(),
});

type ScheduleAppointmentInput = z.infer<
	typeof ScheduleAppointmentInputSchema
>;

export type ScheduleAppointmentOutput = {
	appointmentId: string;
	clientId: string;
	startTime: Date;
};

export const scheduleAppointmentUseCase = async (
	input: ScheduleAppointmentInput,
): Promise<ScheduleAppointmentOutput> => {
	const command = ScheduleAppointmentInputSchema.parse(input);

	const findOrCreateSchedule = usePort(findOrCreateDailySchedulePort);
	const saveSchedule = usePort(saveDailySchedulePort);

	const startTime = command.startTime;
	const endTime = new Date(
		startTime.getTime() + command.durationInMinutes * 60_000,
	);
	const timeSlot = TimeSlot.create({ start: startTime, end: endTime });

	const scheduleId = toDateKey(startTime);

	const schedule = await findOrCreateSchedule(scheduleId);
	schedule.actions.book({ clientId: command.clientId, timeSlot });
	await saveSchedule(schedule);

	const newAppointment =
		schedule.state.appointments[schedule.state.appointments.length - 1];

	if (!newAppointment) {
		throw new Error("Failed to create appointment");
	}

	return {
		appointmentId: newAppointment.id,
		clientId: newAppointment.clientId,
		startTime: newAppointment.timeSlot.start,
	};
};
