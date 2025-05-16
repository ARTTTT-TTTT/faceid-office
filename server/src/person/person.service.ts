// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service'; // สมมติว่าคุณมี PrismaService อยู่แล้ว
// import { CreatePersonDto } from './dto/create-person.dto'; // DTO สำหรับสร้าง Person

// @Injectable()
// export class PersonService {
//   constructor(private readonly prisma: PrismaService) {}

//   async createPerson(adminId: string, dto: CreatePersonDto) {
//     try {
//       const newPerson = await this.prisma.person.create({
//         data: {
//           fullName: dto.fullName,
//           position: dto.position,
//           admin: {
//             connect: { id: adminId },
//           },
//         },
//       });
//       return newPerson;
//     } catch (error) {
//       // จัดการ error ที่อาจเกิดขึ้น เช่น adminId ไม่ถูกต้อง
//       console.error('Error creating person:', error);
//       throw error;
//     }
//   }

//   // ฟังก์ชันอื่นๆ ของ PersonService (getPeople, updatePerson, deletePerson, uploadProfileImage) จะอยู่ที่นี่
// }
