enum UserLogStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

interface UserLog {
  index: number;
  name: string;
  image: string;
  timestamp: string;
  status: UserLogStatus;
}

export type { UserLog };
