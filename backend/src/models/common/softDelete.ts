export interface ISoftDelete {
  isDeleted: boolean;
  deletedAt?: Date | null;
}

export const softDeleteFields = {
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
} as const;

export const notDeletedCondition = { isDeleted: { $ne: true } } as const;

export const mergeNotDeleted = <T extends Record<string, unknown>>(
  filter: T = {} as T,
): T & { isDeleted: { $ne: true } } => ({
  ...filter,
  isDeleted: { $ne: true },
});
