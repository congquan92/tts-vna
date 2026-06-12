import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../entities/role.entity";

@Injectable()
export class RoleRepository {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async findRoleById(roleId: number) {
        return await this.roleRepository.findOne({
            where: { id: roleId },
        });
    }

    async findRoleByName(name: string) {
        return this.roleRepository.findOne({
            where: { name },
        });
    }
}