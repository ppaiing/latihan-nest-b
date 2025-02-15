import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateMahasiswaDTO } from './dto/create-mahasiswa.dto';
import prisma from './prisma';
import { RegisterUserDTO } from './dto/register-user.dto';
import { hashSync, compareSync } from 'bcrypt';
import { LoginUserDTO } from './dto/login-user.dto';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

@Injectable()
export class AppService {
  constructor(private readonly jwtService: JwtService) { }

  async register(data: RegisterUserDTO) {
    try {
      const user = await prisma.user.findFirst({
        where: { username: data.username }
      });
      if (user) {
        throw new BadRequestException("Username Sudah Ada");
      }
      const hashedPassword = hashSync(data.password, 10);
      const newUser = await prisma.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          role: "USER"
        }
      });
      return newUser;
    } catch (err) {
      throw new BadRequestException("Ada Masalah Pada Server");
    }
  }

  async uploadMahasiswaGambar(nim: string, file: Express.Multer.File) {
    const mahasiswa = await prisma.mahasiswa.findFirst({ where: { nim } });
    if (!mahasiswa) throw new NotFoundException('Mahasiswa Tidak Ditemukan');

    const uploadDir = join(__dirname, '../uploads/');
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

    const fileExt = extname(file.originalname);
    const baseFilename = mahasiswa.nim;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${baseFilename}-${uniqueSuffix}${fileExt}`;
    const filePath = join(uploadDir, filename);

    writeFileSync(filePath, file.buffer);

    await prisma.mahasiswa.update({ where: { nim }, data: { foto_profile: filename } });
    return filename;
  }

  async searchMahasiswa(nim?: string) {
    try {
      const mahasiswa = await prisma.mahasiswa.findMany({
        where: {
          AND: [
            nim ? { nim: { equals: nim } } : {},
          ],
        },
      });
      return mahasiswa;
    } catch (error) {
      throw new InternalServerErrorException('Ada masalah pada server');
    }
  }

  async getMahasiswaFoto(nim: string) {
    const mahasiswa = await prisma.mahasiswa.findFirst({ where: { nim } });
    if (!mahasiswa) throw new NotFoundException('Mahasiswa Tidak Ditemukan');
    return mahasiswa.foto_profile;
  }

  async auth(user_id: number) {
    try {
      const user = await prisma.user.findFirst({ where: { id: user_id } });
      if (!user) throw new NotFoundException("User Tidak Ditemukan");
      return user;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException("Terdapat Masalah Dari Server Harap Coba Lagi dalam beberapa menit");
    }
  }

  async login(data: LoginUserDTO) {
    try {
      const user = await prisma.user.findFirst({ where: { username: data.username } });
      if (!user) {
        throw new BadRequestException("Username Tidak Ada");
      }
      const isPasswordValid = compareSync(data.password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException("Password Salah");
      }
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      const token = await this.jwtService.signAsync(payload);
      return { token };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException("Ada Masalah Pada Server");
    }
  }

  async getMahasiswa() {
    return await prisma.mahasiswa.findMany();
  }

  async getMahasiswaByNIM(nim: string) {
    const mahasiswa = await prisma.mahasiswa.findFirst({ where: { nim } });
    if (!mahasiswa) throw new NotFoundException("Tidak Menemukan NIM");
    return mahasiswa;
  }

  async addMahasiswa(data: CreateMahasiswaDTO) {
    await prisma.mahasiswa.create({ data });
    return await prisma.mahasiswa.findMany();
  }

  async deleteMahasiswa(nim: string) {
    const mahasiswa = await prisma.mahasiswa.findFirst({ where: { nim } });
    if (!mahasiswa) throw new NotFoundException("Tidak Menemukan NIM");
    await prisma.mahasiswa.delete({ where: { nim } });
    return await prisma.mahasiswa.findMany();
  }

  async putMahasiswa(nim: string) {
    const mahasiswa = await prisma.mahasiswa.findFirst({ where: { nim } });
    if (!mahasiswa) throw new NotFoundException("Tidak Menemukan NIM");
    await prisma.mahasiswa.delete({ where: { nim } });
    return await prisma.mahasiswa.findMany();
  }
}