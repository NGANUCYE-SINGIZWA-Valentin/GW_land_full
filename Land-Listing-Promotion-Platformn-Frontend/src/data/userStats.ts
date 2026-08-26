export interface UserStatBar {
  name: string;
  value: number;
  fill: string;
}

export interface UserStatLegendItem {
  label: string;
  value: number;
  color: string;
}

export interface UserStatDataset {
  title: string;
  subtitle: string;
  centralLabel: string;
  centralValue: number;
  bars: UserStatBar[];
  legend: UserStatLegendItem[];
}

export interface UserStatFilterOption {
  id: string;
  label: string;
  dataset: UserStatDataset;
}

export interface UserStatFilterCategory {
  id: string;
  label: string;
  options: UserStatFilterOption[];
}

type UserStatsConfig = UserStatFilterCategory[];

export const USER_STATS_CONFIG: UserStatsConfig = [
  {
    id: 'byRole',
    label: 'By Role',
    options: [
      {
        id: 'sellers',
        label: 'Sellers',
        dataset: {
          title: 'Seller Analytics',
          subtitle: 'Seller listings and deal closures on the platform',
          centralLabel: 'Total Sellers',
          centralValue: 3247,
          bars: [
            { name: 'Total Sellers', value: 3247, fill: 'transparent' },
            { name: 'Active Listings', value: 1524, fill: '#FF8A48' },
            { name: 'Deals Closed', value: 876, fill: '#6366F1' },
          ],
          legend: [
            { label: 'Deals Closed', value: 876, color: '#6366F1' },
            { label: 'Active Listings', value: 1524, color: '#FF8A48' },
          ],
        },
      },
      {
        id: 'subAdmins',
        label: 'Sub Admins',
        dataset: {
          title: 'Sub Admin Analytics',
          subtitle: 'Sub admin moderation and review activity',
          centralLabel: 'Total Sub Admins',
          centralValue: 186,
          bars: [
            { name: 'Total Sub Admins', value: 186, fill: 'transparent' },
            { name: 'Active Moderation', value: 97, fill: '#FF8A48' },
            { name: 'Reports Reviewed', value: 143, fill: '#6366F1' },
          ],
          legend: [
            { label: 'Reports Reviewed', value: 143, color: '#6366F1' },
            { label: 'Active Moderation', value: 97, color: '#FF8A48' },
          ],
        },
      },
    ],
  },
  {
    id: 'byVerification',
    label: 'By Verification Status',
    options: [
      {
        id: 'verified',
        label: 'Verified',
        dataset: {
          title: 'Verified Users',
          subtitle: 'Overview of verified user activity on the platform',
          centralLabel: 'Verified Users',
          centralValue: 4580,
          bars: [
            { name: 'Verified Users', value: 4580, fill: 'transparent' },
            { name: 'Active Listings', value: 2340, fill: '#FF8A48' },
            { name: 'Deals Completed', value: 1200, fill: '#6366F1' },
          ],
          legend: [
            { label: 'Deals Completed', value: 1200, color: '#6366F1' },
            { label: 'Active Listings', value: 2340, color: '#FF8A48' },
          ],
        },
      },
      {
        id: 'pendingVerification',
        label: 'Pending Verification',
        dataset: {
          title: 'Pending Verification',
          subtitle: 'Overview of users awaiting verification',
          centralLabel: 'Pending Users',
          centralValue: 892,
          bars: [
            { name: 'Pending Users', value: 892, fill: 'transparent' },
            { name: 'Submitted Docs', value: 534, fill: '#FF8A48' },
            { name: 'Awaiting Review', value: 358, fill: '#6366F1' },
          ],
          legend: [
            { label: 'Awaiting Review', value: 358, color: '#6366F1' },
            { label: 'Submitted Docs', value: 534, color: '#FF8A48' },
          ],
        },
      },
      {
        id: 'unverified',
        label: 'Unverified',
        dataset: {
          title: 'Unverified Users',
          subtitle: 'Overview of unverified user activity on the platform',
          centralLabel: 'Unverified Users',
          centralValue: 528,
          bars: [
            { name: 'Unverified Users', value: 528, fill: 'transparent' },
            { name: 'Incomplete Profiles', value: 312, fill: '#FF8A48' },
            { name: 'Flagged Accounts', value: 89, fill: '#6366F1' },
          ],
          legend: [
            { label: 'Flagged Accounts', value: 89, color: '#6366F1' },
            { label: 'Incomplete Profiles', value: 312, color: '#FF8A48' },
          ],
        },
      },
    ],
  },
  {
    id: 'byAccountStatus',
    label: 'By Account Status',
    options: [
      {
        id: 'active',
        label: 'Active',
        dataset: {
          title: 'Active Users',
          subtitle: 'Overview of active user engagement on the platform',
          centralLabel: 'Active Users',
          centralValue: 4200,
          bars: [
            { name: 'Active Users', value: 4200, fill: 'transparent' },
            { name: 'Monthly Logins', value: 3100, fill: '#FF8A48' },
            { name: 'Listings Viewed', value: 8500, fill: '#6366F1' },
          ],
          legend: [
            { label: 'Listings Viewed', value: 8500, color: '#6366F1' },
            { label: 'Monthly Logins', value: 3100, color: '#FF8A48' },
          ],
        },
      },
      {
        id: 'inactive',
        label: 'Inactive',
        dataset: {
          title: 'Inactive Users',
          subtitle: 'Overview of inactive accounts on the platform',
          centralLabel: 'Inactive Users',
          centralValue: 1150,
          bars: [
            { name: 'Inactive Users', value: 1150, fill: 'transparent' },
            { name: 'Dormant 30d+', value: 680, fill: '#FF8A48' },
            { name: 'Dormant 90d+', value: 470, fill: '#6366F1' },
          ],
          legend: [
            { label: 'Dormant 90+ Days', value: 470, color: '#6366F1' },
            { label: 'Dormant 30+ Days', value: 680, color: '#FF8A48' },
          ],
        },
      },
      {
        id: 'suspended',
        label: 'Suspended',
        dataset: {
          title: 'Suspended Accounts',
          subtitle: 'Overview of suspended accounts on the platform',
          centralLabel: 'Suspended Users',
          centralValue: 128,
          bars: [
            { name: 'Suspended Users', value: 128, fill: 'transparent' },
            { name: 'Under Review', value: 45, fill: '#FF8A48' },
            { name: 'Permanent', value: 83, fill: '#6366F1' },
          ],
          legend: [
            { label: 'Permanent Ban', value: 83, color: '#6366F1' },
            { label: 'Under Review', value: 45, color: '#FF8A48' },
          ],
        },
      },
    ],
  },
];

export function getDatasetById(categoryId: string, optionId: string): UserStatDataset | undefined {
  const category = USER_STATS_CONFIG.find((c) => c.id === categoryId);
  if (!category) return undefined;
  const option = category.options.find((o) => o.id === optionId);
  return option?.dataset;
}

export function getDefaultDataset(): UserStatDataset {
  return USER_STATS_CONFIG[0].options[0].dataset;
}