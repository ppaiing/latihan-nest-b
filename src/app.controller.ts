import { Controller, Get, Post, Body, Delete, Param, Put, Res, UseGuards} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateMahasiswaDTO} from './dto/create-mahasiswa.dto';
import { UpdateMahasiswaDTO } from './dto/update-mahasiswa.dto';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { Response } from 'express';
import { UserDecorator } from './user.decorator';
import { AuthGuard } from './auth.guard';
import { User } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Post("mahasiswa")
  @ApiBody({type : CreateMahasiswaDTO})
  createMahasiswa(@Body ()data : CreateMahasiswaDTO ){
    return this.appService.addMahasiswa(data);

  }
  @Delete("mahasiswa/:nim") // disebut param , pet itu statis dan param itu dinamis 
  deleteMahasiswa(@Param("nim") nim : string) {
    return this.appService.deleteMahasiswa(nim);
  }
  @Put("mahasiswa/:nim")
  @ApiBody({type : UpdateMahasiswaDTO})
  editMahasiswa(@Param("nim") nim : string, @Body() data : UpdateMahasiswaDTO){
    return this.appService.putMahasiswa(nim);
  }

  @Get("mahasiswa")
  getMahasiswa(){
    return this.appService.getMahasiswa();
  }

  @Post("register")
  @ApiBody({
    type : RegisterUserDTO
  })
  register(@Body() data : RegisterUserDTO){
    return this.appService.register(data);
  }

  @Get("/auth")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  auth(@UserDecorator() user : User) {
  return user
  }

  @Post("Login")
  @ApiBody({
    type : LoginUserDTO
  })
  async login(@Body() data : LoginUserDTO, 
  @Res({passthrough : true}) res : Response){
    const result = await this.appService.login(data);
    res.cookie("token", result.token);

    return result
  }

  @Get("mahasiswa/:nim")
  getMahasiswaByNIM(@Param("nim") nim : string){
    return this.appService.getMahasiswaByNIM(nim);

  
  }
}