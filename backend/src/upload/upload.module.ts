import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = uuidv4();
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    ],
    controllers: [UploadController],
})
export class UploadModule { }
