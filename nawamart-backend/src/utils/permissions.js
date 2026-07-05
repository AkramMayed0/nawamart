/**
 * Role-Based Access Control (RBAC) definitions.
 *
 * Store-level roles for staff members within a store:
 *   store_owner     — full access (the merchant who created the store)
 *   store_manager   — manage products, orders, customers, staff (read), settings
 *   staff           — process orders, manage customers
 *   designer        — modify store appearance, manage products
 *   content_editor  — manage products and content
 *   viewer          — read-only access
 */

const ROLES = {
  store_owner: 'store_owner',
  store_manager: 'store_manager',
  staff: 'staff',
  designer: 'designer',
  content_editor: 'content_editor',
  viewer: 'viewer',
};

const ROLE_HIERARCHY = {
  store_owner: 100,
  store_manager: 80,
  designer: 60,
  content_editor: 50,
  staff: 40,
  viewer: 10,
};

const PERMISSIONS = {
  // ─── Store ───
  'store.read': { default: [ROLES.store_owner, ROLES.store_manager, ROLES.designer, ROLES.content_editor, ROLES.staff, ROLES.viewer] },
  'store.update': { default: [ROLES.store_owner, ROLES.store_manager] },
  'store.update_appearance': { default: [ROLES.store_owner, ROLES.designer] },

  // ─── Products ───
  'products.read': { default: [ROLES.store_owner, ROLES.store_manager, ROLES.designer, ROLES.content_editor, ROLES.staff, ROLES.viewer] },
  'products.create': { default: [ROLES.store_owner, ROLES.store_manager, ROLES.designer, ROLES.content_editor] },
  'products.update': { default: [ROLES.store_owner, ROLES.store_manager, ROLES.designer, ROLES.content_editor] },
  'products.delete': { default: [ROLES.store_owner, ROLES.store_manager] },

  // ─── Orders ───
  'orders.read': { default: [ROLES.store_owner, ROLES.store_manager, ROLES.staff, ROLES.viewer] },
  'orders.update_status': { default: [ROLES.store_owner, ROLES.store_manager, ROLES.staff] },
  'orders.delete': { default: [ROLES.store_owner] },

  // ─── Customers ───
  'customers.read': { default: [ROLES.store_owner, ROLES.store_manager, ROLES.staff, ROLES.viewer] },
  'customers.manage': { default: [ROLES.store_owner, ROLES.store_manager] },

  // ─── Staff ───
  'staff.read': { default: [ROLES.store_owner, ROLES.store_manager] },
  'staff.create': { default: [ROLES.store_owner] },
  'staff.update': { default: [ROLES.store_owner] },
  'staff.delete': { default: [ROLES.store_owner] },

  // ─── Finance ───
  'finance.read': { default: [ROLES.store_owner, ROLES.store_manager] },

  // ─── Reports ───
  'reports.read': { default: [ROLES.store_owner, ROLES.store_manager, ROLES.viewer] },

  // ─── Settings ───
  'settings.read': { default: [ROLES.store_owner, ROLES.store_manager] },
  'settings.update': { default: [ROLES.store_owner] },
};

function hasPermission(storeRole, permission) {
  const permDef = PERMISSIONS[permission];
  if (!permDef) return false;
  const userLevel = ROLE_HIERARCHY[storeRole] || 0;
  return permDef.default.some((role) => ROLE_HIERARCHY[role] <= userLevel);
}

function getRolePermissions(storeRole) {
  const userLevel = ROLE_HIERARCHY[storeRole] || 0;
  const result = {};
  for (const [perm, def] of Object.entries(PERMISSIONS)) {
    result[perm] = def.default.some((role) => ROLE_HIERARCHY[role] <= userLevel);
  }
  return result;
}

function isRoleAtLeast(storeRole, minRole) {
  const userLevel = ROLE_HIERARCHY[storeRole] || 0;
  const minLevel = ROLE_HIERARCHY[minRole] || 0;
  return userLevel >= minLevel;
}

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  hasPermission,
  getRolePermissions,
  isRoleAtLeast,
};
