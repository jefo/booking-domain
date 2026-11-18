import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import { toDateKey } from "../domain/date-key";
import {
	findAppointmentByIdPort,
	findOrCreateDailySchedulePort,
	saveDailySchedulePort,
} from "./ports";

export const CancelAppointmentInputSchema = z.object({
	appointmentId: z.string().uuid(),
});

type CancelAppointmentInput = z.infer<
	typeof CancelAppointmentInputSchema
>;

export type CancelAppointmentOutput = {
	appointmentId: string;
	status: "cancelled";
};

export const cancelAppointmentUseCase = async (
	input: CancelAppointmentInput,
): Promise<CancelAppointmentOutput> => {
	const command = CancelAppointmentInputSchema.parse(input);

	const findAppointmentById = usePort(findAppointmentByIdPort);
	const findOrCreateSchedule = usePort(findOrCreateDailySchedulePort);
	const saveSchedule = usePort(saveDailySchedulePort);

	const appointment = await findAppointmentById(command.appointmentId);
	if (!appointment) {
		throw new Error("Appointment not found");
	}

	const scheduleId = toDateKey(appointment.state.timeSlot.start);

	const schedule = await findOrCreateSchedule(scheduleId);
	schedule.actions.cancel({ appointmentId: command.appointmentId });
	await saveSchedule(schedule);

	return {
		appointmentId: command.appointmentId,
		status: "cancelled",
	};
};
