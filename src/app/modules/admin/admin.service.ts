/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import Admin from './admin.model';
import { IAdmin, IAdminFilters } from './admin.interface';
import { SortOrder } from 'mongoose';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { adminSearchableFields } from './admin.constant';
import User from '../user/user.model';

const updateAdmin = async (
  id: string,
  payload: Partial<IAdmin>
): Promise<IAdmin | null> => {
  const isExists = await Admin.findOne({ id });
  if (!isExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found!!!');
  }

  const { name, ...admin } = payload;

  const updatedAdminData: Partial<IAdmin> = { ...admin };

  // Dynamically Handling Update
  if (name && Object.keys(name).length > 0) {
    Object.keys(name).forEach(key => {
      const nameKey = `name.${key}`;
      (updatedAdminData as any)[nameKey] = name[key as keyof typeof name];
    });
  }

  const result = await Admin.findOneAndUpdate({ id }, updatedAdminData, {
    new: true,
  }).populate('managementDepartment');

  return result;
};

const getSingleAdmin = async (id: string): Promise<IAdmin | null> => {
  const result = await Admin.findOne({ id }).populate('managementDepartment');
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not find admin!');
  }
  return result;
};

const getAllAdmins = async (
  filters: IAdminFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IAdmin[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: adminSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Admin.find(whereConditions)
    .populate('managementDepartment')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Admin.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const deleteAdmin = async (id: string): Promise<IAdmin | null> => {
  const deletedUser = await User.findOneAndDelete({ id });
  if (!deletedUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found to deleted!');
  }

  const result = await Admin.findOneAndDelete({ id: deletedUser.id }).populate(
    'managementDepartment'
  );
  return result;
};

export const AdminService = {
  updateAdmin,
  getSingleAdmin,
  getAllAdmins,
  deleteAdmin,
};
