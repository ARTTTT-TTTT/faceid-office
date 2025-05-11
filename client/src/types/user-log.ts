enum UserLogStatus {
  ON_TIME = 'on_time',
  LATE = 'late',
}

interface UserLog {
  id: string;
  name: string;
  image: string;
  timestamp: string;
  status: UserLogStatus;
}

export type { UserLog };
export { UserLogStatus };
