// entry-exit.controller.ts
import { Controller, Get , Post ,Body } from '@nestjs/common';
import { EntryExitService } from './entry-exit.service';
import { EntryExitPaginationDto } from './dto/entry-exit-pagination.dto';

@Controller('entry-exit')
export class EntryExitController {
 constructor(private readonly entryExitService: EntryExitService) {}

 @Get()
 findAll() {
   return this.entryExitService.findAll();
 }

 @Post('list')
   findAllWithDetails(@Body() paginationDto: EntryExitPaginationDto) {
       return this.entryExitService.findAllWithDetails(
           paginationDto.page, 
           paginationDto.limit
       );
   }
}

