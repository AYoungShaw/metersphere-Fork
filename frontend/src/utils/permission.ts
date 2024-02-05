import { RouteLocationNormalized, RouteRecordNormalized, RouteRecordRaw } from 'vue-router';
import { includes } from 'lodash-es';

import { firstLevelMenu } from '@/config/permission';
import { INDEX_ROUTE } from '@/router/routes/base';
import appRoutes from '@/router/routes/index';
import { useAppStore, useUserStore } from '@/store';
import { SystemScopeType, UserRole, UserRolePermissions } from '@/store/modules/user/types';

export function hasPermission(permission: string, typeList: string[]) {
  const userStore = useUserStore();
  if (userStore.isAdmin) {
    return true;
  }
  const { projectPermissions, orgPermissions, systemPermissions } = userStore.currentRole;

  if (projectPermissions.length === 0 && orgPermissions.length === 0 && systemPermissions.length === 0) {
    return false;
  }

  if (typeList.includes('PROJECT') && projectPermissions.includes(permission)) {
    return true;
  }
  if (typeList.includes('ORGANIZATION') && orgPermissions.includes(permission)) {
    return true;
  }
  if (typeList.includes('SYSTEM') && systemPermissions.includes(permission)) {
    return true;
  }
  return false;
}

/**
 * 判断是否有任一权限
 * @param permissions 权限列表
 */
export function hasAnyPermission(permissions: string[], typeList = ['PROJECT', 'ORGANIZATION', 'SYSTEM']) {
  if (!permissions || permissions.length === 0) {
    return true;
  }
  return permissions.some((permission) => hasPermission(permission, typeList));
}

/**
 * 判断是否有所有权限
 * @param permissions 权限列表
 */
export function hasAllPermission(permissions: string[], typeList = ['PROJECT', 'ORGANIZATION', 'SYSTEM']) {
  if (!permissions || permissions.length === 0) {
    return true;
  }
  return permissions.every((permission) => hasPermission(permission, typeList));
}

function filterProject(role: UserRole, id: string) {
  return role && role.type === 'PROJECT' && (role.scopeId === id || role.scopeId === 'global');
}
function filterOrganization(role: UserRole, id: string) {
  return role && role.type === 'ORGANIZATION' && (role.scopeId === id || role.scopeId === 'global');
}
function filterSystem(role: UserRole, id: string) {
  return role && role.type === 'SYSTEM' && role.scopeId === id;
}

export function composePermissions(userRolePermissions: UserRolePermissions[], type: SystemScopeType, id: string) {
  let func: (role: UserRole, val: string) => boolean;
  switch (type) {
    case 'PROJECT':
      func = filterProject;
      break;
    case 'ORGANIZATION':
      func = filterOrganization;
      break;
    default:
      func = filterSystem;
      break;
  }
  return userRolePermissions
    .filter((ur) => func(ur.userRole, id))
    .flatMap((role) => role.userRolePermissions)
    .map((g) => g.permissionId);
}

// 判断当前一级菜单是否有权限
export function topLevelMenuHasPermission(route: RouteLocationNormalized | RouteRecordRaw) {
  const userStore = useUserStore();
  const appStore = useAppStore();
  if (userStore.isAdmin) {
    // 如果是超级管理员，或者是系统设置菜单，或者是项目菜单，都有权限
    return true;
  }
  const { currentMenuConfig } = appStore;
  return currentMenuConfig.includes(route.name as string) && hasAnyPermission(route.meta?.roles || []);
}

// 有权限的第一个路由名，如果没有找到则返回IndexRoute
export function getFirstRouteNameByPermission(routerList: RouteRecordNormalized[]) {
  const currentRoute = routerList
    .filter((item) => includes(firstLevelMenu, item.name))
    .sort((a, b) => {
      return (a.meta.order || 0) - (b.meta.order || 0);
    })
    .find((item) => hasAnyPermission(item.meta.roles || []));
  return currentRoute?.name || INDEX_ROUTE.name;
}

// 判断当前路由名有没有权限
export function routerNameHasPermission(routerName: string, routerList: RouteRecordNormalized[]) {
  const currentRoute = routerList.find((item) => item.name === routerName);
  return currentRoute ? hasAnyPermission(currentRoute.meta?.roles || []) : false;
}

export function findRouteByName(name: string) {
  const queue: RouteRecordNormalized[] = [...appRoutes];
  while (queue.length > 0) {
    const currentRoute = queue.shift();
    if (!currentRoute) {
      return;
    }
    if (currentRoute.name === name) {
      return currentRoute;
    }
    if (currentRoute.children) {
      queue.push(...(currentRoute.children as RouteRecordNormalized[]));
    }
  }
  return null;
}

// 找到当前路由下 第一个由权限的子路由
export function getFisrtRouterNameByCurrentRoute(parentName: string) {
  const currentRoute = findRouteByName(parentName);
  if (currentRoute) {
    const hasAuthChildrenRouter = currentRoute.children.find((item) => hasAnyPermission(item.meta?.roles || []));
    return hasAuthChildrenRouter ? hasAuthChildrenRouter.name : parentName;
  }
  return parentName;
}
