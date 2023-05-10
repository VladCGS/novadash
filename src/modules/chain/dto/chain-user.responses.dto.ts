import { ApiProperty } from '@nestjs/swagger';

export class ChainMetaDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string | null;

  @ApiProperty()
  id: string;
}
