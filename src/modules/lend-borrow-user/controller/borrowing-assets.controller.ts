import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  JWTAuthGuard,
  RolesGuard,
  CheckIdValidGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FormBorrowingAssetsWithAPYDTO } from '../dto/borrowing-assets-request.dto';
import { BorrowAssetsWithAPYPageDTO } from '../dto/borrowing-assets-response.dto';
import { BorrowingAssetsPageService } from '../services/borrowing-assets-page.service';

@Controller('borrowing-assets')
@ApiTags('borrowing-assets')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({
    field: ['id'],
    findIn: 'userData',
  }),
  new CheckRecordFieldExistGuard([
    {
      isFieldOptional: true,
      sourceField: 'id',
      Entity: User,
      entityField: 'id',
      dataSource: 'userData',
    },
  ]),
)
@Roles(AppRoles.USER)
export class BorrowingAssetsController {
  constructor(private borrowingAssetsPageService: BorrowingAssetsPageService) {}

  @Post('list')
  @ApiOKResponse(
    'Successfully fetched borrowing options',
    BorrowAssetsWithAPYPageDTO,
  )
  async getBorrowingAssetsPage(
    @Body() body: FormBorrowingAssetsWithAPYDTO,
    @Req() req,
  ): Promise<BorrowAssetsWithAPYPageDTO> {
    const { id: userId } = req.userData;

    return this.borrowingAssetsPageService.getPage(body, userId);
  }
}
