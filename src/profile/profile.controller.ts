import { BadRequestException, Controller, Get, Param, Post, Query, Res, Response, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserDecorator } from 'src/user.decorator';
import { User } from '@prisma/client';
import { response } from 'express';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @UserDecorator() user: User) {
    if (!file) throw new BadRequestException("File tidak boleh kosong!!");
    
    return this.profileService.uploadFile(file, user.id);
  }

  @Get("search-mahasiswa")
  async searchMahasiswa(@Query("nama") nama: string, @Query("nim") nim: string) {
    return this.profileService.searchMahasiswa(nama, nim);
  }

  @Get("/:id")
  async getProfile(@Param("id") id: number, @Res()Response) {

    const filename = await this.profileService.sendMyFotoProfile(id);

    return response.sendFile(`../../uploads`+filename);
  }
}
