// Backward-compat re-exports — domain services now live under src/domains/
export { authService }        from '@domains/auth/services';
export { matchService, FORMAT_LABEL, SKILL_LABEL, FORMAT_RAW, SKILL_RAW } from '@domains/match/services';
export { squadService, teamService } from '@domains/squad/services';
export { profileService }     from '@domains/profile/services';
export { notificationService } from '@domains/notifications/services';
