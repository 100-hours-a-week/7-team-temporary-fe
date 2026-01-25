import type { ComponentType, SVGProps } from "react";

import Edit from "./assets/Edit.svg";
import LogoDefault from "./assets/logo-default.svg";
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

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const IconMap = {
  logoDefault: LogoDefault,
  edit: Edit,
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
} as const satisfies Record<string, SvgComponent>;

export type IconName = keyof typeof IconMap;
