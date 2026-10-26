import type { MenuItemType } from "@/menu/menu.type";

interface MenuUser {
  userType?: string;
  roles?: string[];
  permissions?: string[];
}

export function filterMenus(
  menus: MenuItemType[],
  user: MenuUser | null,
): MenuItemType[] {
  if (!user) {
    return [];
  }

  const hasAccess = (item: MenuItemType): boolean => {
    const userTypeAllowed =
      !item.userTypes || item.userTypes.includes(user.userType ?? "");

    const roleAllowed = !item.roles?.some((role) => user.roles?.includes(role));

    const permissionAllowed =
      !item.permissions ||
      item.permissions.every((permission) =>
        user.permissions?.includes(permission),
      );

    return userTypeAllowed && roleAllowed && permissionAllowed;
  };

  return menus.reduce<MenuItemType[]>((result, item) => {
    const children = item.children
      ? filterMenus(item.children, user)
      : undefined;

    const visibleItem = {
      ...item,
      ...(children ? { children } : {}),
    };

    const hasVisibleChildren = Boolean(children?.length);
    const isAccessibleLink = Boolean(item.path) && hasAccess(item);

    if (hasAccess(item) && (hasVisibleChildren || isAccessibleLink)) {
      result.push(visibleItem);
    }

    return result;
  }, []);
}
