import type { ComponentType, SVGProps } from "react";

import DeleteIcon from "./assets/Delete-icon.svg";
import Edit from "./assets/Edit.svg";
import Fire from "./assets/Fire-icon.svg";
import LogoDefault from "./assets/logo-default.svg";
import LogoWhite from "./assets/logo-white.svg";
import More from "./assets/More-icon.svg";
import Share from "./assets/Share-icon.svg";
import StarGreen from "./assets/Star-Green.svg";
import StarYellow from "./assets/Star-Yellow.svg";
import Unliked from "./assets/UnLiked-icon.svg";
import Prev from "./assets/Prev-icon.svg";
import Next from "./assets/Next-icon.svg";
import Info from "./assets/Info-icon.svg";
import Success from "./assets/Success-icon.svg";
import Notification from "./assets/Notification-icon.svg";
import Error from "./assets/Error-icon.svg";
import Eye from "./assets/Eye-icon.svg";
import EyeOff from "./assets/Eye-off-icon.svg";
import CalendarPlus from "./assets/Calendar-plus-icon.svg";
import Home_filled from "./assets/Home-filled-icon.svg";
import Home_outline from "./assets/Home-outline-icon.svg";
import User_filled from "./assets/User-filled-icon.svg";
import User_outline from "./assets/User-outline-icon.svg";
import Todo_Check from "./assets/todo-check-icon.svg";
import Todo_Unchecked from "./assets/todo-unCheck-icon.svg";
import FireIcon from "./assets/Fire-icon.svg";

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const IconMap = {
  logoDefault: LogoDefault,
  logoWhite: LogoWhite,
  delete: DeleteIcon,
  edit: Edit,
  fire: Fire,
  more: More,
  share: Share,
  starGreen: StarGreen,
  starYellow: StarYellow,
  unliked: Unliked,
  prev: Prev,
  next: Next,
  info: Info,
  success: Success,
  notification: Notification,
  error: Error,
  eye: Eye,
  eye_off: EyeOff,
  calendar_plus: CalendarPlus,
  home_filled: Home_filled,
  home_outline: Home_outline,
  user_filled: User_filled,
  user_outline: User_outline,
  todo_check: Todo_Check,
  todo_unchecked: Todo_Unchecked,
  fireIcon: FireIcon,
} as const satisfies Record<string, SvgComponent>;

export type IconName = keyof typeof IconMap;
