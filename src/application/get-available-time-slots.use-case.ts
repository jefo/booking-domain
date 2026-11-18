import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import { findSchedulesByDateRangePort } from "./ports";

export const GetAvailableTimeSlotsInputSchema = z.object({
	startDate: z.date(),
	endDate: z.date(),
});

type GetAvailableTimeSlotsInput = z.infer<
	typeof GetAvailableTimeSlotsInputSchema
>;

export type TimeSlotDTO = {
	start: Date;
	end: Date;
};

export type GetAvailableTimeSlotsOutput = TimeSlotDTO[];

export const getAvailableTimeSlotsUseCase = async (
	input: GetAvailableTimeSlotsInput,
): Promise<GetAvailableTimeSlotsOutput> => {
	const query = GetAvailableTimeSlotsInputSchema.parse(input);
	const findSchedules = usePort(findSchedulesByDateRangePort);

	const schedules = await findSchedules(query);

	const bookedSlots = schedules
		.flatMap((schedule) => schedule.state.appointments)
		.filter((appointment) => appointment.status === "confirmed")
		.map((appointment) => appointment.timeSlot);

	const availableSlots: TimeSlotDTO[] = [];
	const workDayStartHour = 9;
	const workDayEndHour = 17;

	for (
		let day = new Date(query.startDate);
		day <= query.endDate;
		day.setDate(day.getDate() + 1)
	) {
		const currentDate = new Date(day);
		currentDate.setHours(workDayStartHour, 0, 0, 0);

		while (currentDate.getHours() < workDayEndHour) {
			const slotStart = new Date(currentDate);
			const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

			const isOverlapping = bookedSlots.some(
				(booked) => slotStart < booked.end && slotEnd > booked.start,
			);

			if (!isOverlapping) {
				availableSlots.push({ start: slotStart, end: slotEnd });
			}

			currentDate.setTime(slotEnd.getTime());
		}
	}

	return availableSlots;
};
