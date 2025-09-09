import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/cs";

dayjs.extend(isoWeek);
dayjs.extend(localizedFormat);
dayjs.locale("cs");

export { dayjs };
export default dayjs;
