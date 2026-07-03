export type UserMenuSubmenuSide = 'left' | 'right'

/** 用户菜单 flyout 子菜单定位：header 向左展开，画布头像菜单向右展开 */
export function userMenuSubmenuFlyoutClass(side: UserMenuSubmenuSide = 'left') {
  return `user-menu-lang-submenu absolute top-0 z-10 ${
    side === 'right' ? 'left-full pl-1' : 'right-full pr-1'
  }`
}
