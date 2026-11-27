import { ActionType } from "../enums/action.enum";

export const ACTIVITY_GIP_PLACEHOLDER = "TBD000";

export function isAdaptationFlowType(type: string | undefined): boolean {
	if (!type) {
		return false;
	}
	return [ActionType.ADAPTION, ActionType.CROSSCUT].includes(type as ActionType);
}

export function isGgaArrayMissing(values: string[] | null | undefined): boolean {
	return !values || values.length === 0;
}