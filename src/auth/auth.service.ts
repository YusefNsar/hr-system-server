import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EmployeeService } from '../employee/employee.service';
import {
  Employee,
  EmployeeDocument,
  EmployeeGroup,
} from '../employee/schemas/employee.schema';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

export type JWTPayload = { id: Types.ObjectId | string };
export const HASH_SALT = 10;

@Injectable()
export class AuthService {
  constructor(
    private employeeService: EmployeeService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(email: string, password: string) {
    const employee = await this.employeeService.findOne({ email });

    // no employee with that email
    if (!employee) {
      throw new UnauthorizedException('Email does not exists');
    }

    // not an hr employee
    if (employee.group !== EmployeeGroup.HR) {
      throw new UnauthorizedException('Only HR employees are allowed to login');
    }

    const isCorrectPass = await bcrypt.compare(password, employee.password);
    if (!isCorrectPass) {
      throw new UnauthorizedException('Wrong password');
    }

    delete employee.password;

    const payload: JWTPayload = { id: employee._id };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
      }),
      employee,
    };
  }

  async getProfile(employeeId: string): Promise<EmployeeDocument> {
    return this.employeeService.findOne({ _id: employeeId });
  }

  async signUp(
    email: string,
    name: string,
    password: string,
  ): Promise<Employee> {
    const hashedPassword = await bcrypt.hash(password, HASH_SALT);

    const employee = await this.employeeService.create({
      email,
      name,
      group: EmployeeGroup.HR,
      password: hashedPassword,
      isVerified: true, // TODO: admin should verify new hr employee accounts
    });

    return {
      ...employee.toObject(),
      password: undefined, // do not return pass hash
    };
  }
}
