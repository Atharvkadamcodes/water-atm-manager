export const CUSTOMER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export const CUSTOMER_FILTER = {
  ALL: 'ALL',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOST_CARD_CURRENT: 'LOST_CARD_CURRENT',
  LOST_CARD_PREVIOUS: 'LOST_CARD_PREVIOUS'
};

export function normalizeCustomerStatus(customer) {
  if (!customer) return CUSTOMER_STATUS.INACTIVE;
  if (customer.status) return customer.status;
  if (customer.is_active) return CUSTOMER_STATUS.ACTIVE;
  return CUSTOMER_STATUS.INACTIVE;
}

export function getStatusLabel(status) {
  switch (status) {
    case CUSTOMER_STATUS.ACTIVE:
      return 'Active';
    default:
      return 'Inactive';
  }
}

export function getStatusBadgeClasses(status) {
  switch (status) {
    case CUSTOMER_STATUS.ACTIVE:
      return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    default:
      return 'text-amber-700 bg-amber-50 border-amber-100';
  }
}

export function customerHasCard(customer) {
  return normalizeCustomerStatus(customer) === CUSTOMER_STATUS.ACTIVE;
}

export function hasOpenLostCard(customer) {
  return Boolean(customer?.has_lost_card);
}
