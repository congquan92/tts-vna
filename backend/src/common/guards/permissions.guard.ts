import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthRepository } from "../../repositories/auth.repository";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private authRepository: AuthRepository,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user; // { id, roleId, orgType }

        if (!user || !user.roleId) {
            throw new ForbiddenException('Bạn không có quyền truy cập');
        }

        const permissions = await this.authRepository.findPermissionsByRole(user.roleId);

        // Kiểm tra
        if (permissions.includes('*')) return true;
        return requiredPermissions.every((p) => permissions.includes(p));
    }
}