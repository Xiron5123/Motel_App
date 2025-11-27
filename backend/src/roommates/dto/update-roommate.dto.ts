import { PartialType } from '@nestjs/swagger';
import { CreateRoommateDto } from './create-roommate.dto';

export class UpdateRoommateDto extends PartialType(CreateRoommateDto) { }
