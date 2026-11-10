// datetime-local values must stay in the user's local timezone.
export function offsetEventTime(value, minutes) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setTime(date.getTime() + minutes * 60000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function endTimeForStart(start, end) {
  if (!start || Number.isNaN(new Date(start).getTime())) return end;
  return !end || !(new Date(end) > new Date(start)) ? offsetEventTime(start, 60) : end;
}
