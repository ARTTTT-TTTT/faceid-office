export const checkboxToggleSelection = (
  id: string,
  list: string[],
  setList: (val: string[]) => void,
) => {
  setList(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);
};
