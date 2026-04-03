import { RootState } from '../../app/store/store';

export const selectCurrentEvent = (state: RootState) => state.event.currentEvent;
export const selectEventLoading = (state: RootState) => state.event.loading;
export const selectEventError = (state: RootState) => state.event.error;