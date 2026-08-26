import { UserStatFilterCategory, UserStatDataset } from './userStats';

export const INQUIRY_STATS_CONFIG: UserStatFilterCategory[] = [
  {
    id: 'conversionOverview',
    label: 'Conversion Overview',
    options: [
      {
        id: 'propertyViews',
        label: 'Property Views',
        dataset: {
          title: 'Inquiry Conversion',
          subtitle: 'Property views vs buyer inquiries',
          centralLabel: 'Conversion Rate',
          centralValue: 18,
          bars: [
            { name: 'Total', value: 8432, fill: 'transparent' },
            { name: 'Property Views', value: 8432, fill: '#FF8A48' },
            { name: 'Buyer Inquiries', value: 1524, fill: '#6366F1' },
          ],
          legend: [
            { label: 'Buyer Inquiries', value: 1524, color: '#6366F1' },
            { label: 'Property Views', value: 8432, color: '#FF8A48' },
          ],
        },
      },
    ],
  },
  {
    id: 'byInquiryStatus',
    label: 'By Inquiry Status',
    options: [
      {
        id: 'new',
        label: 'New',
        dataset: {
          title: 'New Inquiries',
          subtitle: 'Recently received buyer inquiries',
          centralLabel: 'New Inquiries',
          centralValue: 487,
          bars: [
            { name: 'Total', value: 1524, fill: 'transparent' },
            { name: 'New', value: 487, fill: '#22C55E' },
            { name: 'Other', value: 1037, fill: '#E2E8F0' },
          ],
          legend: [
            { label: 'New', value: 487, color: '#22C55E' },
            { label: 'Others', value: 1037, color: '#E2E8F0' },
          ],
        },
      },
      {
        id: 'replied',
        label: 'Replied',
        dataset: {
          title: 'Replied Inquiries',
          subtitle: 'Inquiries that received a response',
          centralLabel: 'Replied',
          centralValue: 623,
          bars: [
            { name: 'Total', value: 1524, fill: 'transparent' },
            { name: 'Replied', value: 623, fill: '#3B82F6' },
            { name: 'Other', value: 901, fill: '#E2E8F0' },
          ],
          legend: [
            { label: 'Replied', value: 623, color: '#3B82F6' },
            { label: 'Others', value: 901, color: '#E2E8F0' },
          ],
        },
      },
      {
        id: 'pending',
        label: 'Pending',
        dataset: {
          title: 'Pending Inquiries',
          subtitle: 'Inquiries awaiting response',
          centralLabel: 'Pending',
          centralValue: 312,
          bars: [
            { name: 'Total', value: 1524, fill: 'transparent' },
            { name: 'Pending', value: 312, fill: '#F59E0B' },
            { name: 'Other', value: 1212, fill: '#E2E8F0' },
          ],
          legend: [
            { label: 'Pending', value: 312, color: '#F59E0B' },
            { label: 'Others', value: 1212, color: '#E2E8F0' },
          ],
        },
      },
      {
        id: 'closed',
        label: 'Closed',
        dataset: {
          title: 'Closed Inquiries',
          subtitle: 'Inquiries that have been resolved',
          centralLabel: 'Closed',
          centralValue: 102,
          bars: [
            { name: 'Total', value: 1524, fill: 'transparent' },
            { name: 'Closed', value: 102, fill: '#EF4444' },
            { name: 'Other', value: 1422, fill: '#E2E8F0' },
          ],
          legend: [
            { label: 'Closed', value: 102, color: '#EF4444' },
            { label: 'Others', value: 1422, color: '#E2E8F0' },
          ],
        },
      },
    ],
  },
  {
    id: 'byPeriod',
    label: 'By Period',
    options: [
      {
        id: 'thisWeek',
        label: 'This Week',
        dataset: {
          title: 'Inquiries This Week',
          subtitle: 'Inquiry activity over the current week',
          centralLabel: 'This Week',
          centralValue: 89,
          bars: [
            { name: 'Total', value: 89, fill: 'transparent' },
            { name: 'New', value: 34, fill: '#22C55E' },
            { name: 'Replied', value: 42, fill: '#3B82F6' },
          ],
          legend: [
            { label: 'Replied', value: 42, color: '#3B82F6' },
            { label: 'New', value: 34, color: '#22C55E' },
          ],
        },
      },
      {
        id: 'thisMonth',
        label: 'This Month',
        dataset: {
          title: 'Inquiries This Month',
          subtitle: 'Inquiry activity over the current month',
          centralLabel: 'This Month',
          centralValue: 412,
          bars: [
            { name: 'Total', value: 412, fill: 'transparent' },
            { name: 'New', value: 156, fill: '#22C55E' },
            { name: 'Replied', value: 198, fill: '#3B82F6' },
          ],
          legend: [
            { label: 'Replied', value: 198, color: '#3B82F6' },
            { label: 'New', value: 156, color: '#22C55E' },
          ],
        },
      },
      {
        id: 'thisYear',
        label: 'This Year',
        dataset: {
          title: 'Inquiries This Year',
          subtitle: 'Inquiry activity over the current year',
          centralLabel: 'This Year',
          centralValue: 1524,
          bars: [
            { name: 'Total', value: 1524, fill: 'transparent' },
            { name: 'New', value: 487, fill: '#22C55E' },
            { name: 'Replied', value: 623, fill: '#3B82F6' },
          ],
          legend: [
            { label: 'Replied', value: 623, color: '#3B82F6' },
            { label: 'New', value: 487, color: '#22C55E' },
          ],
        },
      },
    ],
  },
];

export function getInquiryDatasetById(categoryId: string, optionId: string): UserStatDataset | undefined {
  const category = INQUIRY_STATS_CONFIG.find((c) => c.id === categoryId);
  if (!category) return undefined;
  const option = category.options.find((o) => o.id === optionId);
  return option?.dataset;
}

export function getDefaultInquiryDataset(): UserStatDataset {
  return INQUIRY_STATS_CONFIG[0].options[0].dataset;
}