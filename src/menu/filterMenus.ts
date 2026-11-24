import type { MenuItemType } from "@/menu/menu.type";
import type { AuthUser } from "@/features/Auth/auth.types";

export const filterMenus = (
  menus: MenuItemType[],
  user: AuthUser | null,
): MenuItemType[] => {
  if (!user) return [];

  const hasAccess = (menu: MenuItemType): boolean => {
    const userTypeAllowed =
      !menu.userTypes?.length || menu.userTypes.includes(user.userType);

    const roleAllowed =
      !menu.roles?.length ||
      menu.roles.some((role) => user.roles.includes(role));

    const permissionAllowed =
      !menu.permissions?.length ||
      (menu.requireAllPermissions
        ? menu.permissions.every((permission) =>
            user.permissions.includes(permission),
          )
        : menu.permissions.some((permission) =>
            user.permissions.includes(permission),
          ));

    return userTypeAllowed && roleAllowed && permissionAllowed;
  };

  return menus.reduce<MenuItemType[]>((result, menu) => {
    if (!hasAccess(menu)) {
      return result;
    }

    if (menu.children?.length) {
      const visibleChildren = filterMenus(menu.children, user);

      if (visibleChildren.length === 0) {
        return result;
      }

      result.push({
        ...menu,
        children: visibleChildren,
      });

      return result;
    }

    result.push(menu);

    return result;
  }, []);
};
