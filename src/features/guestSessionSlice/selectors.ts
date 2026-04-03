import { RootState } from '../../app/store/store';

export const selectRemainingShots = (state: RootState) => state.guestSession.remainingShots;
export const selectIsLimitReached = (state: RootState) => state.guestSession.isLimitReached;
export const selectSessionLoading = (state: RootState) => state.guestSession.loading;