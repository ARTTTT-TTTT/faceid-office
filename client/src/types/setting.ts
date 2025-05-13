enum RedisStatus {
  START = 'start',
  END = 'end',
}

interface RedisStartStatus {
  admin: string;
  status: RedisStatus;
  ttl_seconds: number;
  ttl_minutes: number;
}

interface RedisStopStatus {
  admin: string;
  status: RedisStatus;
}

interface Setting {
  _id: string;
  user_log_expire_seconds: number;
  work_start_time: number;
  update_at: string;
}

interface SettingCreatePayload {
  user_log_expire_seconds: number;
  work_start_time: number;
}

interface SettingUpdatePayload {
  id: string;
  user_log_expire_seconds: number;
  work_start_time: number;
}

interface SettingUserLogExpireSeconds {
  user_log_expire_seconds: number;
}

interface SettingWorkStartTime {
  work_start_time: number;
}

export type {
  RedisStartStatus,
  RedisStopStatus,
  Setting,
  SettingCreatePayload,
  SettingUpdatePayload,
  SettingUserLogExpireSeconds,
  SettingWorkStartTime,
};
export { RedisStatus };
