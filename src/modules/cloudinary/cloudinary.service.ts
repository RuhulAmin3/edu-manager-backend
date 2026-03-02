import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImageToCloud(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file.path, (err, result) => {
        fs.unlinkSync(file.path);
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async deleteImageFromCloud(
    publicId: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (err, result) => {
        if (err) {
          reject(err); // Handle error by rejecting promise
        } else {
          resolve(result); // Resolve with the result
        }
      });
    });
  }

  // async deleteImageFromCloud(publicId: string): Promise<any> {
  //   try {
  //     return await cloudinary.uploader.destroy(publicId);
  //   } catch (error) {
  //     throw new BadRequestException('Failed to delete file', error.message);
  //   }
  // }
}
