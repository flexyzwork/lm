import {
  Controller,
  Get,
  Post,
  Res,
  UseInterceptors,
  Bind,
  UploadedFiles,
} from '@nestjs/common';
import express from 'express';

import { FilesInterceptor } from '@nestjs/platform-express';
import { multerDiskOptions, uploadFileURL } from './multer.options';
import * as XLSX from 'xlsx';

@Controller('file')
export class FileController {
  constructor() {}
  /**
   * @param {File[]} files 다중 파일
   * @param res Response 객체
   */
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', undefined, multerDiskOptions))
  @Bind(UploadedFiles())
  uploadFileDisk(files: File[]) {
    return files.map((file: any) => {
      if (file.mimetype === 'application/vnd.ms-excel') {
        return this.xlsxToJson(file);
      }
      return uploadFileURL(file.filename);
    });
  }

  async xlsxToJson(file: any): Promise<any> {
    const workbook = XLSX.readFile(`public/uploads/${file.filename}`);
    const sheetNameList = workbook.SheetNames;
    const worksheet = workbook.Sheets[sheetNameList[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);
    return json;
  }

  @Get('down-xlsx')
  async downloadXlsx(data: any, @Res() res: express.Response) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, {
      header: ['id', 'name', 'email', 'password', 'signupVerifyToken'],
    });
    XLSX.utils.book_append_sheet(wb, ws, 'users_list');

    res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.end(Buffer.from(XLSX.write(wb, { type: 'base64' }), 'base64'));
  }
}
