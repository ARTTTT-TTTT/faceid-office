enum Position {
  STUDENT,
  MANAGER,
  EMPLOYEE,
  OFFICER,
  GUEST
}

interface Person {
  id: number;
  fullName: string;
  position: Position;
}

export type { Person };
