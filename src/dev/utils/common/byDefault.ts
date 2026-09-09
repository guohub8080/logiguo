import { isNil } from "es-toolkit/predicate"

export default (given: any, defaultValue: any) => {
  if (isNil(given)) return defaultValue
  return given
}