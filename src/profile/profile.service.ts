import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { extname } from 'path';
import prisma from 'src/prisma';

@Injectable()
export class ProfileService {
    async uploadFile (file : Express.Multer.File, user_id: number){
        const user = await 
        prisma.user.findFirst({
            where : {
                id : user_id
            }
        }) 
        if (user == null) throw new NotFoundException ("TIDAK MENEMUKAN USER")
        if (user.foto_profile != null) {
            const filePath = `../../uploads/${user.foto_profile}`;
            if(existsSync(filePath)) {
                rmSync (filePath)
            }
        }

        const uploadPath = `../../uploads`;
            if (existsSync(uploadPath)){
                mkdirSync (uploadPath);
            }
            const fileExt = extname (file.originalname);
            const baseFilename = user.username;
            const uniqueSuffix = Date.now()+'_'+ Math.round(Math.random() * 1E9);
            const filename = `${baseFilename}-${uniqueSuffix}${fileExt}`;
            const filePath =`${uploadPath}/${filename}`;

            writeFileSync(filePath, file.buffer);
            await prisma.user.update({
                where :{
                    id : user_id
                },
                data : {
                    foto_profile : filename
                }
            })
            return {filename, path:filePath};

        }
        
        async sendMyFotoProfile(user_id : number){
            const user = await prisma.user.findFirst({
                where : {
                    id : user_id
                }
            })
            if (user == null)throw new NotFoundException("Tidak Menemukan ser")
                return user.foto_profile
        }
        async searchMahasiswa(nama?: string, nim?: string) {
            return prisma.mahasiswa.findMany({
                where: {
                    AND: [
                        nama ? { nama: { contains: nama, mode: 'insensitive' } } : {},
                        nim ? { nim: { contains: nim, mode: 'insensitive' } } : {}
                    ]
                }
            });
        }
        
}
