import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import { IStudent, IStudentFilters } from './student.interface';
import { paginationFields } from '../../../constants/pagination';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { StudentService } from './student.service';
import { studentFilterableFields } from './student.constant';
import sendResponse from '../../../shared/sendResponse';
import { Request, Response } from 'express';

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const filters: IStudentFilters = pick(req.query, studentFilterableFields);

  const paginationOptions: IPaginationOptions = pick(
    req.query,
    paginationFields
  );

  const result = await StudentService.getAllStudents(
    filters,
    paginationOptions
  );

  sendResponse<IStudent[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Students Retrieved Successfully!',
    meta: result.meta,
    data: result.data,
  });
});

export const StudentController = { getAllStudents };
