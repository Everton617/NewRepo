import { Role } from '@prisma/client';

type RoleType = (typeof Role)[keyof typeof Role];
export type Action = 'create' | 'update' | 'read' | 'delete' | 'leave';
export type Resource =
  | 'team'
  | 'team_member'
  | 'team_invitation'
  | 'team_sso'
  | 'team_dsync'
  | 'team_audit_log'
  | 'team_webhook'
  | 'team_payments'
  | 'team_api_key'
  | 'team_order'
  | 'team_evo_instance'
  | 'team_contact'
  | 'team_label'
  | 'team_inventory_product'
  | 'team_inventory_category'
  | 'team_inventory_category_subcategory'
  | 'team_inventory_category_subcategory_product'
  | 'team_inventory_category_product'
  | 'team_inventory_subcategory'
  | 'team_inventory_subcategory'

type RolePermissions = {
  [role in RoleType]: Permission[];
};

export type Permission = {
  resource: Resource;
  actions: Action[] | '*';
};

export const availableRoles = [
  {
    id: Role.MEMBER,
    name: 'Member',
  },
  {
    id: Role.ADMIN,
    name: 'Admin',
  },
  {
    id: Role.OWNER,
    name: 'Owner',
  },
];

export const permissions: RolePermissions = {
  OWNER: [
    {
      resource: 'team',
      actions: '*',
    },
    {
      resource: 'team_member',
      actions: '*',
    },
    {
      resource: 'team_invitation',
      actions: '*',
    },
    {
      resource: 'team_sso',
      actions: '*',
    },
    {
      resource: 'team_dsync',
      actions: '*',
    },
    {
      resource: 'team_audit_log',
      actions: '*',
    },
    {
      resource: 'team_payments',
      actions: '*',
    },
    {
      resource: 'team_webhook',
      actions: '*',
    },
    {
      resource: 'team_api_key',
      actions: '*',
    },
    {
      resource: 'team_order',
      actions: '*',
    },
    {
      resource: 'team_evo_instance',
      actions: '*',
    },
    {
      resource: 'team_contact',
      actions: '*',
    },
    {
      resource: 'team_label',
      actions: '*',
    },
    {
      resource: 'team_inventory_product',
      actions: '*',
    },
    {
      resource: 'team_inventory_category',
      actions: '*',
    },
    {
      resource: 'team_inventory_category_subcategory',
      actions: '*',
    },
    {
      resource: 'team_inventory_category_subcategory_product',
      actions: '*',
    },
    {
      resource: 'team_inventory_category_product',
      actions: '*',
    },
    {
      resource: 'team_inventory_subcategory',
      actions: '*',
    },
  ],
  ADMIN: [
    {
      resource: 'team',
      actions: '*',
    },
    {
      resource: 'team_member',
      actions: '*',
    },
    {
      resource: 'team_invitation',
      actions: '*',
    },
    {
      resource: 'team_sso',
      actions: '*',
    },
    {
      resource: 'team_dsync',
      actions: '*',
    },
    {
      resource: 'team_audit_log',
      actions: '*',
    },
    {
      resource: 'team_webhook',
      actions: '*',
    },
    {
      resource: 'team_api_key',
      actions: '*',
    },
    {
      resource: 'team_order',
      actions: '*',
    },
    {
      resource: 'team_evo_instance',
      actions: '*',
    },
    {
      resource: 'team_inventory_product',
      actions: '*',
    },
    {
      resource: 'team_inventory_category',
      actions: '*',
    },
    {
      resource: 'team_inventory_category_subcategory',
      actions: '*',
    },
    {
      resource: 'team_inventory_category_subcategory_product',
      actions: '*',
    },
    {
      resource: 'team_inventory_category_product',
      actions: '*',
    },
    {
      resource: 'team_inventory_subcategory',
      actions: '*',
    },
  ],
  MEMBER: [
    {
      resource: 'team',
      actions: ['read', 'leave'],
    },
    {
      resource: 'team_order',
      actions: '*',
    },
    {
      resource: 'team_evo_instance',
      actions: ['read'],
    },
    {
      resource: 'team_contact',
      actions: ['read'],
    },
    {
      resource: 'team_label',
      actions: ['read'],
    },
    {
      resource: 'team_inventory_product',
      actions: ['read'],
    },
    {
      resource: 'team_inventory_category',
      actions: ['read'],
    },
    {
      resource: 'team_inventory_category_subcategory',
      actions: ['read'],
    },
    {
      resource: 'team_inventory_category_subcategory_product',
      actions: ['read'],
    },
    {
      resource: 'team_inventory_category_product',
      actions: ['read'],
    },
    {
      resource: 'team_inventory_subcategory',
      actions: ['read'],
    },
  ],
};
